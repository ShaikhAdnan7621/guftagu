import User from '@/models/User';
import ChatRequest from '@/models/ChatRequest';
import Chat from '@/models/Chat';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const { shareableKey } = await req.json();
    
    const targetUser = await User.findOne({ 'shareableKey.key': shareableKey });
    if (!targetUser) {
      return Response.json({ message: 'Invalid or expired key' }, { status: 404 });
    }
    
    // Check key expiry
    if (targetUser.shareableKey?.expiresAt && new Date() > new Date(targetUser.shareableKey.expiresAt)) {
      return Response.json({ message: 'Key has expired' }, { status: 400 });
    }
    
    if (targetUser._id.toString() === decoded.userId) {
      return Response.json({ message: 'Cannot send request to yourself' }, { status: 400 });
    }
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [decoded.userId, targetUser._id] }
    });
    
    if (existingChat) {
      return Response.json({ message: 'Chat already exists' }, { status: 400 });
    }
    
    // Check if request already exists (both directions)
    const existingRequest = await ChatRequest.findOne({
      $or: [
        { from: decoded.userId, to: targetUser._id, status: 'pending' },
        { from: targetUser._id, to: decoded.userId, status: 'pending' }
      ]
    });
    
    if (existingRequest) {
      return Response.json({ message: 'Request already exists' }, { status: 400 });
    }
    
    // Create new chat request
    await ChatRequest.create({
      from: decoded.userId,
      to: targetUser._id
    });
    
    return Response.json({ message: 'Chat request sent successfully' });
  } catch (error) {
    return Response.json({ message: 'Failed to send request' }, { status: 500 });
  }
}