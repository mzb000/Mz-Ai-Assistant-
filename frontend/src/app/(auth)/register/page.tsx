"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Bot } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, username, password);
      router.push("/chat");
    } catch {
      setError("Registration failed. Email or username may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm glass rounded-2xl p-8 neon-border animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-neon-500 to-purple-600 flex items-center justify-center">
          <Bot size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gradient">Create Account</h1>
        <p className="text-sm text-muted mt-1">Join Zabi AI Assistant</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="zabi_user"
          required
        />
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-4 py-2">{error}</p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-neon-400 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
