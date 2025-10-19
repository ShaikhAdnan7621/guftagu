import ChatRequest from '@/models/ChatRequest';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function GET(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    const requests = await ChatRequest.find({
      to: decoded.userId,
      status: 'pending'
    }).populate('from', 'username email').sort({ createdAt: -1 });
    
    return Response.json({ requests });
  } catch (error) {
    return Response.json({ message: 'Failed to fetch requests' }, { status: 500 });
  }
}