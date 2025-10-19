import Message from '@/models/Message';
import Chat from '@/models/Chat';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const { chats = [], actions = [] } = await req.json();

    // Process actions first (writes)
    const actionResults = await processActions(actions, decoded.userId);
    
    // Get updates for requested chats (reads)
    const updates = await getBatchUpdates(chats, decoded.userId);
    
    return Response.json({
      updates,
      actionResults,
      timestamp: Date.now()
    });

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

      const messages = await Message.find(query)
        .populate('sender', 'username')
        .sort({ createdAt: 1 })
        .limit(50);

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
  
  for (const action of actions) {
    try {
      switch (action.type) {
        case 'send':
          results[action.id] = await createMessage(action, userId);
          break;
        case 'edit':
          results[action.id] = await editMessage(action, userId);
          break;
        case 'delete':
          results[action.id] = await deleteMessage(action, userId);
          break;
        default:
          results[action.id] = { error: 'Unknown action type' };
      }
    } catch (error) {
      results[action.id] = { error: error.message };
    }
  }
  
  return results;
}

async function createMessage(action, userId) {
  // Verify user is part of chat
  const chat = await Chat.findById(action.chatId);
  if (!chat || !chat.participants.includes(userId)) {
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