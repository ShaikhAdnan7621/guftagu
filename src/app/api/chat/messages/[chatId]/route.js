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
    
    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '30');
        
    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(decoded.userId)) {
      return Response.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Don't auto-mark messages as seen - let client control this
    
    const messages = await Message.find({ chat: chatId })
      .populate([
        { path: 'sender', select: 'username' },
        { path: 'replyTo', select: 'content sender', populate: { path: 'sender', select: 'username' } },
        { path: 'reactions.users', select: 'username' }
      ])
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    // Reverse to show oldest first (chronological order)
    messages.reverse();
    
    const totalMessages = await Message.countDocuments({ chat: chatId });
    const hasMore = offset + limit < totalMessages;
    
    console.log('Found messages:', messages.length, 'hasMore:', hasMore);
    
    return Response.json({ messages, hasMore });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return Response.json({ message: 'Failed to fetch messages' }, { status: 500 });
  }
}