import Message from '@/models/Message';
import Chat from '@/models/Chat';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function GET(req, { params }) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const { chatId } = await params;
    
    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(decoded.userId)) {
      return Response.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 })
      .limit(100);
    
    // Mark messages as read
    await Message.updateMany(
      { 
        chat: chatId, 
        sender: { $ne: decoded.userId },
        'readBy.user': { $ne: decoded.userId }
      },
      { 
        $push: { 
          readBy: { 
            user: decoded.userId, 
            readAt: new Date() 
          } 
        } 
      }
    );
    
    return Response.json({ messages });
  } catch (error) {
    return Response.json({ message: 'Failed to fetch messages' }, { status: 500 });
  }
}