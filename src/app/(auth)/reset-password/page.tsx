"use client";
import { useState, Suspense, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";

function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // Only allow numbers

    if (val.length > 1) {
      // Handle paste
      const pasted = val.slice(0, 6);
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    const newOtp = value.split("");
    newOtp[index] = val;
    onChange(newOtp.join(""));

    if (val !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // If empty, move focus back
        const newOtp = value.split("");
        newOtp[index - 1] = "";
        onChange(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const focusIndex = Math.min(pasted.length, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="h-14 w-12 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-900 transition-all outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 sm:h-14 sm:w-14 sm:text-2xl dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      ))}
    </div>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const sentParam = searchParams.get("sent");

  const [step, setStep] = useState(token ? 2 : 1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState(emailParam || "");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState(
    sentParam === "true"
      ? "Password reset link and OTP sent! Please check your email."
      : ""
  );
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP");
      }
      return data;
    },
    onSuccess: () => {
      setMessage("");
      setStep(2);
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!password || password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (!token && (!otp || !email)) {
        throw new Error("Please provide a valid token or your email and OTP.");
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, otp, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "An error occurred");
      }
      return data;
    },
    onSuccess: () => {
      setMessage("Password updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
  });

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtpMutation.mutate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetMutation.mutate();
  };

  return (
    <>
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-600/10 dark:border-emerald-500/30 dark:bg-emerald-600/20">
          <FaLock className="text-2xl text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {step === 1 ? "Verify OTP" : "Create New Password"}
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          {step === 1
            ? emailParam
              ? `Enter the 6-digit OTP sent to ${emailParam}`
              : "Enter your email and the 6-digit OTP"
            : "Enter your new secure password below"}
        </p>
      </div>

      {(verifyOtpMutation.isError || resetMutation.isError) && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-900/30 p-3 text-center text-sm text-red-400">
          {verifyOtpMutation.error?.message || resetMutation.error?.message}
        </div>
      )}

      {message && (
        <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-900/30 p-3 text-center text-sm text-emerald-400">
          {message}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          {!emailParam && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                />
              </div>
            </div>
          )}
          <div className="pt-2 pb-4">
            <OtpInput value={otp} onChange={setOtp} />
          </div>
          <button
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="mt-2 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              New Password
            </label>
            <div className="relative">
              <FaLock className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-11 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-slate-500" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pr-11 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-all outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending || message !== ""}
            className="mt-2 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resetMutation.isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <Suspense
            fallback={<div className="text-center text-slate-500">Loading...</div>}
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
