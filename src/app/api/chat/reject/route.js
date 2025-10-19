import ChatRequest from '@/models/ChatRequest';
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
      return Response.json({ message: 'Request not found' }, { status: 404 });
    }
    
    request.status = 'rejected';
    await request.save();
    
    return Response.json({ message: 'Request rejected' });
  } catch (error) {
    return Response.json({ message: 'Failed to reject request' }, { status: 500 });
  }
}