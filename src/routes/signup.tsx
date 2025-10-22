import * as React from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { signUp } from "../lib/auth-client";
import BackgroundCarousel from "../components/BackgroundCarousel";
import { signupCarouselImages } from "../lib/carousel-images";
import toast from "react-hot-toast";

export const Route = createFileRoute("/signup")({
  component: SignUpForm,
});

export default function SignUpForm() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [repeatPassword, setRepeatPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== repeatPassword) {
      setError("Both your passwords must match.");
      return;
    }

    await signUp.email(
      { email, password, name },
      {
        onSuccess: () => {
          navigate({ to: "/" });
          toast.success("Account created!");
        },
        onError: () => {
          setError("Sign up failed");
        },
      }
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundCarousel images={signupCarouselImages} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-[#292B49] to-[#7E9FC8] p-6 text-white">
            <h2 className="text-2xl font-bold text-center">Sign Up</h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-[rgba(255,107,107,0.1)] border border-[#FF6B6B] rounded-md text-[#FF6B6B] text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#64748B]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#64748B]"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[#64748B]"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="repeat-password"
                  className="block text-sm font-medium text-[#64748B]"
                >
                  Repeat Password
                </label>
                <input
                  id="repeat-password"
                  type="password"
                  placeholder="Repeat your password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 mt-4 bg-gradient-to-r from-[#292B49] to-[#7E9FC8] text-white rounded-md border-none cursor-pointer"
              >
                Sign Up
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-sm text-[#64748B]">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-[#7E9FC8] font-medium no-underline"
                >
                  Sign In
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
