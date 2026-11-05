import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select(
      "+resetPasswordOtp +resetPasswordExpire"
    );

    if (
      !user ||
      !user.resetPasswordExpire ||
      user.resetPasswordExpire.getTime() < Date.now()
    ) {
      return NextResponse.json({ message: "Invalid or expired OTP" }, { status: 400 });
    }

    if (!user.resetPasswordOtp) {
      return NextResponse.json(
        { message: "No OTP was requested for this account" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(otp, user.resetPasswordOtp);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP verified successfully" }, { status: 200 });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
