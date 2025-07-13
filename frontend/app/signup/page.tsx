"use client";
import { Appbar } from "@/components/Appbar";
import { CheckFeature } from "@/components/CheckFeature";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import { HeroVideo } from "@/components/HeroVideo";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
        email,
        password,
        name,
      });
      router.push("/login");
    } catch (err) {
      console.error("Signup failed", err);
    }
  };

  return (
    <div>
      <Appbar />
      <div className="flex justify-center p-6">
        <div className="flex flex-col lg:flex-row max-w-5xl w-full gap-8">
          {/* Left section */}
          <div className="flex-1 pt-12 px-4">
            <h2 className="font-semibold text-3xl mb-6">
              Join millions worldwide who automate their work using Zapier.
            </h2>
            <div className="space-y-4 text-gray-700">
              <CheckFeature label="Easy setup, no coding required" />
              <CheckFeature label="Free forever for core features" />
              <CheckFeature label="14-day trial of premium features & apps" />
            </div>
          </div>

          {/* Right section (form) */}
          <div className="flex-1 bg-white border rounded-2xl shadow-md p-8">
            <div className="space-y-4">
              <Input
                label="Name"
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Your Name"
              />
              <Input
                label="Email"
                onChange={(e) => setEmail(e.target.value)}
                type="text"
                placeholder="Your Email"
              />
              <Input
                label="Password"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
              />
              <div className="pt-2">
                <PrimaryButton onClick={handleSignup} size="big">
                  Get started free
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pt-8">
        <HeroVideo />
      </div>
    </div>
  );
}
