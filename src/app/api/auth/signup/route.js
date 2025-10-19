// src\app\api\auth\signup\route.js

import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';

// Next.js API route handler
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { username, email, password } = body;

    // Validate input
    if (!username || !email || !password) {
      return Response.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      return Response.json(
        { message: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate keys
    const passKey = uuidv4();
    const shareableKey = Math.random().toString(36).substring(2, 10).toUpperCase();
    const keyExpiration = new Date(Date.now() + 20 * 60 * 1000); // 20 minutes

    // Create new user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      passkey: passKey,
      shareableKey: {
        key: shareableKey,
        expiresAt: keyExpiration,
        isActive: true
      }
    });

    return Response.json(
      { message: 'User created successfully', passKey },
      { status: 200 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    return Response.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}
