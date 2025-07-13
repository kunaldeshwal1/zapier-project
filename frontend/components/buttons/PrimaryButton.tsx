import { ReactNode } from "react";

export const PrimaryButton = ({
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
      } cursor-pointer hover:bg-blue-800 hover:shadow-xl duration-500 bg-blue-700 text-white rounded-full text-center flex justify-center flex-col`}
    >
      {children}
    </div>
  );
};
