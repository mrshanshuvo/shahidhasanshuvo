import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, otp, email, password } = await req.json();
    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 });
    }
    if (!token && (!otp || !email)) {
      return NextResponse.json(
        { message: "Either a reset link token or an OTP and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    let user: any = null;

    if (token) {
      // Flow A: Magic Link Token
      const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

      user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return NextResponse.json(
          { message: "Invalid or expired token" },
          { status: 400 }
        );
      }
    } else {
      // Flow B: OTP + Email
      user = await User.findOne({ email }).select(
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
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
