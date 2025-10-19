import User from '@/models/User';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
  try {
    await connectDB();
    
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return Response.json({ message: 'User not found' }, { status: 404 });
    }

    // Generate new 8-digit shareable key
    const newShareableKey = Math.random().toString(36).substring(2, 10).toUpperCase();
    const keyExpiration = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

    user.shareableKey = {
      key: newShareableKey,
      expiresAt: keyExpiration,
      isActive: true
    };

    await user.save();

    return Response.json({ 
      message: 'New shareable key generated',
      shareableKey: user.shareableKey 
    });
  } catch (error) {
    return Response.json({ message: 'Failed to generate key' }, { status: 500 });
  }
}