import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { localDb } from "@/lib/localDb";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    console.log("Register API called");

    const body = await req.json();
    const { name, email, password, phone } = body;

    console.log("Register data:", { name, email, phone });

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email and password are required" }, { status: 400 });
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

    if (useLocalDb) {
      // Use local storage
      try {
        const user = await localDb.createUser({ name, email, password, phone: phone || "" });
        console.log("User created in local storage:", user.id);
        return NextResponse.json({ message: "User Registered", success: true });
      } catch (error: any) {
        console.log("Local storage error:", error.message);
        return NextResponse.json({ message: error.message }, { status: 400 });
      }
    }

    // Use MongoDB
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone
    });

    console.log("User created:", user._id);

    return NextResponse.json({ message: "User Registered", success: true });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ message: error.message || "Registration failed" }, { status: 500 });
  }
}