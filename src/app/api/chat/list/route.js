import Chat from '@/models/Chat';
import Message from '@/models/Message';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    const chats = await Chat.find({
      participants: new mongoose.Types.ObjectId(decoded.userId)
    })
    .populate('participants', 'username email')
    .sort({ lastActivity: -1 });
    
    return Response.json({ chats });
  } catch (error) {
    console.error('Chat list error:', error);
    return Response.json({ message: 'Failed to fetch chats', error: error.message }, { status: 500 });
  }
}