import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { localDb } from "@/lib/localDb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    console.log("Login API called");

    const body = await req.json();
    const { email, password } = body;

    console.log("Login attempt:", email);

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    // Try MongoDB first, fallback to local DB
    let useLocalDb = false;

    try {
      await connectDB();
      console.log("MongoDB connected");
    } catch (dbError: any) {
      console.log("MongoDB unavailable, using local storage:", dbError.message);
      useLocalDb = true;
    }

    const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV !== "production" ? "dev-insecure-jwt-secret" : undefined);
    if (!jwtSecret) {
      console.error("JWT_SECRET not defined in production");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    if (useLocalDb) {
      // Use local storage
      const user = await localDb.findUserByEmail(email);
      if (!user) {
        console.log("User not found in local storage:", email);
        return NextResponse.json({ message: "Invalid Email" }, { status: 400 });
      }

      const isMatch = await localDb.validatePassword(user, password);
      if (!isMatch) {
        console.log("Invalid password for:", email);
        return NextResponse.json({ message: "Invalid Password" }, { status: 400 });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        jwtSecret,
        { expiresIn: "1h" }
      );

      console.log("Login successful (local storage) for:", email);
      return NextResponse.json({ token, success: true });
    }

    // Use MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json({ message: "Invalid Email" }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("Invalid password for:", email);
      return NextResponse.json({ message: "Invalid Password" }, { status: 400 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      jwtSecret,
      { expiresIn: "1h" }
    );

    console.log("Login successful for:", email);
    return NextResponse.json({ token, success: true });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ message: error.message || "Login failed" }, { status: 500 });
  }
}
