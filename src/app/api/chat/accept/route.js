import ChatRequest from '@/models/ChatRequest';
import Chat from '@/models/Chat';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const { requestId } = await req.json();
    
    const request = await ChatRequest.findById(requestId);
    if (!request || request.to.toString() !== decoded.userId || request.status !== 'pending') {
      return Response.json({ message: 'Request not found or already processed' }, { status: 404 });
    }
    
    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [request.from, request.to] }
    });
    
    if (existingChat) {
      // Update request status even if chat exists
      request.status = 'accepted';
      await request.save();
      return Response.json({ message: 'Chat already exists', chatId: existingChat._id });
    }
    
    // Create new chat
    const chat = await Chat.create({
      participants: [request.from, request.to]
    });
    
    // Update users' chattedWith arrays
    await User.findByIdAndUpdate(request.from, {
      $addToSet: { chattedWith: request.to }
    });
    
    await User.findByIdAndUpdate(request.to, {
      $addToSet: { chattedWith: request.from }
    });
    
    // Update request status
    request.status = 'accepted';
    await request.save();
    
    return Response.json({ message: 'Request accepted', chatId: chat._id });
  } catch (error) {
    return Response.json({ message: 'Failed to accept request' }, { status: 500 });
  }
}