import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
  try {
    await connectDB();
    const { username, password, passkey } = await req.json();

    if (!username || (!password && !passkey)) {
      return Response.json(
        { message: 'Username and password or passkey required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ username });
    if (!user) {
      return Response.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    let isValid = false;
    
    if (password) {
      isValid = await bcrypt.compare(password, user.password);
    } else if (passkey) {
      isValid = user.passkey === passkey;
    }

    if (!isValid) {
      return Response.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return Response.json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}