"use client";
import { useRouter } from "next/navigation";
import { Feature } from "./Feature";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { SecondaryButton } from "./buttons/SecondaryButton";

export const Hero = () => {
  const router = useRouter();

  return (
    <div className="py-12 px-4">
      <div className="flex justify-center">
        <h1 className="text-5xl font-bold text-center max-w-xl">
          Automate as fast as you can type
        </h1>
      </div>

      <div className="flex justify-center pt-6">
        <p className="text-xl text-center max-w-2xl">
          AI gives you automation superpowers, and Zapier puts them to work.
          Pairing AI and Zapier helps you turn ideas into workflows and bots
          that work for you.
        </p>
      </div>

      <div className="flex justify-center pt-8">
        <div className="flex gap-4">
          <PrimaryButton onClick={() => router.push("/signup")} size="big">
            Get Started Free
          </PrimaryButton>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-6 pt-10">
        <Feature title="Free Forever" subtitle="for core features" />
        <Feature title="More Apps" subtitle="than any other platforms" />
        <Feature title="Cutting Edge" subtitle="AI Features" />
      </div>
    </div>
  );
};
