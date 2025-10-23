import Message from '@/models/Message';
import Chat from '@/models/Chat';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const { chats = [], actions = [] } = await req.json();


    // Update user's last active time
    await User.findByIdAndUpdate(decoded.userId, {
      lastActive: new Date()
    });

    // Process actions first (writes)
    const actionResults = await processActions(actions, decoded.userId);
    
    // Get updates for requested chats (reads)
    const updates = await getBatchUpdates(chats, decoded.userId);
    
    const response = {
      updates,
      actionResults,
      timestamp: Date.now()
    };
    
    return Response.json(response);

  } catch (error) {
    console.error('Batch update error:', error);
    return Response.json({ message: 'Batch update failed' }, { status: 500 });
  }
}

async function getBatchUpdates(chatRequests, userId) {
  const updates = {};
  
  if (chatRequests.length === 0) return updates;

  for (const req of chatRequests) {
    try {
      // Verify user is part of chat
      const chat = await Chat.findById(req.chatId);
      if (!chat || !chat.participants.includes(userId)) {
        continue;
      }

      // Build query for new messages
      const query = { chat: req.chatId };
      
      if (req.lastSync) {
        query.createdAt = { $gt: new Date(req.lastSync) };
      }
      
      if (req.lastMessageId) {
        query._id = { $gt: req.lastMessageId };
      }
	  
      // Don't auto-mark messages as seen - let client control this

      const messages = await Message.find(query)
        .populate([
          { path: 'sender', select: 'username' },
          { path: 'replyTo', select: 'content sender', populate: { path: 'sender', select: 'username' } },
          { path: 'reactions.users', select: 'username' },
          // removed readBy population - status/seen removed
        ])
        .sort({ createdAt: 1 })
        .limit(30);

      updates[req.chatId] = {
        messages,
        hasMore: messages.length >= 50,
        lastSync: Date.now()
      };

    } catch (error) {
      updates[req.chatId] = {
        messages: [],
        hasMore: false,
        lastSync: Date.now(),
        error: error.message
      };
    }
  }
  
  return updates;
}

async function processActions(actions, userId) {
  const results = {};
  
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const actionKey = action.id || i;
    try {
      switch (action.type) {
        case 'send':
          results[actionKey] = await createMessage(action, userId);
          break;
        case 'reply':
          results[actionKey] = await createReply(action, userId);
          break;
        case 'react':
          results[actionKey] = await toggleReaction(action, userId);
          break;
        case 'edit':
          results[actionKey] = await editMessage(action, userId);
          break;
        case 'delete':
          results[actionKey] = await deleteMessage(action, userId);
          break;
        case 'markRead':
          results[actionKey] = await markMessageRead(action, userId);
          break;
        case 'batchMarkSeen':
          results[actionKey] = await batchMarkMessagesSeen(action, userId);
          break;
        default:
          results[actionKey] = { error: 'Unknown action type' };
      }
    } catch (error) {
      results[actionKey] = { error: error.message };
    }
  }
  
  return results;
}

async function createMessage(action, userId) {
  
  // Verify user is part of chat
  const chat = await Chat.findById(action.chatId);
  if (!chat || !chat.participants.includes(userId)) {
    console.log('Unauthorized: User not in chat');
    throw new Error('Unauthorized');
  }

  const message = await Message.create({
    chat: action.chatId,
    sender: userId,
    content: action.content
  });
  
  
  // Update chat activity
  await Chat.findByIdAndUpdate(action.chatId, {
    lastMessage: message._id,
    lastActivity: new Date(),
    $inc: { messageCount: 1 }
  });
  
  await message.populate('sender', 'username');
  return { success: true, message };
}

async function createReply(action, userId) {
  // Verify user is part of chat
  const chat = await Chat.findById(action.chatId);
  if (!chat || !chat.participants.includes(userId)) {
    throw new Error('Unauthorized');
  }

  // Verify reply target exists
  const replyTarget = await Message.findById(action.replyTo);
  if (!replyTarget || replyTarget.chat.toString() !== action.chatId) {
    throw new Error('Invalid reply target');
  }

  const message = await Message.create({
    chat: action.chatId,
    sender: userId,
    content: action.content,
    replyTo: action.replyTo
  });
  
  // Update chat activity
  await Chat.findByIdAndUpdate(action.chatId, {
    lastMessage: message._id,
    lastActivity: new Date(),
    $inc: { messageCount: 1 }
  });
  
  await message.populate(['sender', 'replyTo'], 'username content');
  return { success: true, message };
}

async function toggleReaction(action, userId) {
  const message = await Message.findById(action.messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  // Verify user is part of chat
  const chat = await Chat.findById(message.chat);
  if (!chat || !chat.participants.includes(userId)) {
    throw new Error('Unauthorized');
  }

  const existingReaction = message.reactions.find(r => r.emoji === action.emoji);
  
  if (existingReaction) {
    const userIndex = existingReaction.users.indexOf(userId);
    if (userIndex > -1) {
      // Remove user's reaction
      existingReaction.users.splice(userIndex, 1);
      if (existingReaction.users.length === 0) {
        // Remove empty reaction
        message.reactions = message.reactions.filter(r => r.emoji !== action.emoji);
      }
    } else {
      // Add user's reaction
      existingReaction.users.push(userId);
    }
  } else {
    // Create new reaction
    message.reactions.push({
      emoji: action.emoji,
      users: [userId]
    });
  }

  await message.save();
  await message.populate('reactions.users', 'username');
  return { success: true, message };
}

async function editMessage(action, userId) {
  const message = await Message.findById(action.messageId);
  if (!message || message.sender.toString() !== userId) {
    throw new Error('Unauthorized');
  }

  message.content = action.content;
  await message.save();
  
  await message.populate('sender', 'username');
  return { success: true, message };
}

async function deleteMessage(action, userId) {
  const message = await Message.findById(action.messageId);
  if (!message || message.sender.toString() !== userId) {
    throw new Error('Unauthorized');
  }

  await Message.findByIdAndDelete(action.messageId);
  return { success: true, messageId: action.messageId };
}

async function markMessageRead(action, userId) {
  const message = await Message.findById(action.messageId);
  if (!message) {
    throw new Error('Message not found');
  }

  // Verify user is part of chat
  const chat = await Chat.findById(message.chat);
  if (!chat || !chat.participants.includes(userId)) {
    throw new Error('Unauthorized');
  }

  // Status/read tracking removed, no-op
  return { success: true, message };
}

async function batchMarkMessagesSeen(action, userId) {
  const { messageIds, chatId } = action;
  
  // Verify user is part of chat
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.participants.includes(userId)) {
    throw new Error('Unauthorized');
  }

  // Status/read tracking removed, do not change messages
  return {
    success: true,
    updatedCount: 0,
    messageIds
  };
}
