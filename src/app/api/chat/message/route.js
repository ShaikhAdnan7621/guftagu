import Message from '@/models/Message';
import Chat from '@/models/Chat';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const { chatId, message } = await req.json();
    
    // Verify user is part of the chat
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(decoded.userId)) {
      return Response.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    // Create new message
    const newMessage = await Message.create({
      chat: chatId,
      sender: decoded.userId,
      content: message
    });
    
    // Update chat's last message and activity
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id,
      lastActivity: new Date()
    });
    
    // Populate sender info
    await newMessage.populate('sender', 'username');
    
    return Response.json({ message: 'Message sent', data: newMessage });
  } catch (error) {
    return Response.json({ message: 'Failed to send message' }, { status: 500 });
  }
}