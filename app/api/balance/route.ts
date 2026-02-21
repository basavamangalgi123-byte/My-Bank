import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { localDb } from "@/lib/localDb";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ message: "No Token" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Try MongoDB first, fallback to local DB
    let useLocalDb = false;

    try {
      await connectDB();
    } catch (dbError: any) {
      console.log("MongoDB unavailable, using local storage for balance");
      useLocalDb = true;
    }

    if (useLocalDb) {
      // Use local storage
      const user = await localDb.findUserByEmail(decoded.email);
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
      return NextResponse.json({ balance: user.balance });
    }

    // Use MongoDB
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ balance: user.balance });

  } catch (error) {
    console.error("Balance error:", error);
    return NextResponse.json({ message: "Invalid Token" }, { status: 401 });
  }
}