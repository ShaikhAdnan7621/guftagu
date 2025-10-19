import User from '@/models/User';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';

function generatePasskey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(req) {
  try {
    await connectDB();
    const { username, password } = await req.json();

    if (!username || !password) {
      return Response.json(
        { message: 'Username and password are required' },
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

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return Response.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const newPasskey = generatePasskey();
    user.passkey = newPasskey;
    await user.save();

    return Response.json({
      message: 'New passkey generated successfully',
      passkey: newPasskey
    });

  } catch (error) {
    console.error('Forgot passkey error:', error);
    return Response.json(
      { message: 'Failed to generate new passkey' },
      { status: 500 }
    );
  }
}