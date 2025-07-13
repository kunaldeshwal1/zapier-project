"use client";
import { useRouter } from "next/navigation";
import { LinkButton } from "./buttons/LinkButton";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import Cookies from "js-cookie";
import { SecondaryButton } from "./buttons/SecondaryButton";
export const Appbar = () => {
  const router = useRouter();
  const [name, setName] = useState<string>("none");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    setIsLoggedIn(!!token);
    setName(username || "none");
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/user/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      Cookies.remove("token");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex border-b justify-between p-4">
      {name != "none" ? (
        <div className="flex flex-col justify-center text-2xl font-extrabold">
          {name}'s Zapier Automation
        </div>
      ) : (
        <div className="flex flex-col justify-center text-2xl font-extrabold">
          Zapier
        </div>
      )}
      <div className="flex">
        {!isLoggedIn ? (
          <>
            <div className="pr-4">
              <SecondaryButton onClick={() => router.push("/login")}>
                Login
              </SecondaryButton>
            </div>
            <PrimaryButton onClick={() => router.push("/signup")}>
              Signup
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton onClick={handleLogout}>Logout</PrimaryButton>
        )}
      </div>
    </div>
  );
};
