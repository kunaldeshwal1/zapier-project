import { ReactNode } from "react";

export const SecondaryButton = ({
  children,
  onClick,
  size = "small",
}: {
  children: ReactNode;
  onClick: () => void;
  size?: "big" | "small";
}) => {
  return (
    <div
      onClick={onClick}
      className={`${size === "small" ? "text-sm" : "text-xl"} ${
        size === "small" ? "px-8 py-2" : "px-10 py-4"
      } cursor-pointer hover:shadow-md duration-500 text-black border border-black  rounded-full text-center flex justify-center flex-col`}
    >
      {children}
    </div>
  );
};
