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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/user/signin`, {
        username: email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.name);
      document.cookie = `token=${res.data.token}; path=/`;
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  return (
    <div>
      <Appbar />
      <div className=" flex justify-center p-6">
        <div className=" flex flex-col lg:flex-row max-w-5xl w-full gap-8">
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
                onChange={(e) => setEmail(e.target.value)}
                label="Email"
                type="text"
                placeholder="Your Email"
              />
              <Input
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                type="password"
                placeholder="Password"
              />
              <div className="pt-2">
                <PrimaryButton onClick={handleLogin} size="big">
                  Login
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
