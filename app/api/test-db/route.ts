import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("Testing MongoDB connection...");

        // Test DNS resolution
        const dns = await import('dns');

        const mongoose = (await import('mongoose')).default;
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            return NextResponse.json({
                error: "MONGODB_URI not defined",
                env: Object.keys(process.env).filter(k => k.includes('MONGO'))
            });
        }

        console.log("Connection string (masked):", MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
        });

        console.log("Connected successfully!");

        return NextResponse.json({
            success: true,
            message: "MongoDB connected successfully",
            readyState: mongoose.connection.readyState
        });

    } catch (error: any) {
        console.error("Connection test failed:", error);
        return NextResponse.json({
            error: error.message,
            name: error.name,
            code: error.code,
            suggestion: "This error usually means: 1) MongoDB Atlas cluster is paused, 2) Your IP is not whitelisted, or 3) Network connectivity issue"
        }, { status: 500 });
    }
}