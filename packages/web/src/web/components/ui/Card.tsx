import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "green" | "orange" | "blue" | "none";
}

export function Card({ children, className = "", glowColor = "none" }: CardProps) {
  const glows = {
    green: "shadow-[0_0_30px_rgba(0,255,136,0.08)] border-[#00FF88]/20",
    orange: "shadow-[0_0_30px_rgba(227,107,59,0.08)] border-[#E36B3B]/20",
    blue: "shadow-[0_0_30px_rgba(58,95,111,0.15)] border-[#3A5F6F]/30",
    none: "border-[#2A2A35]",
  };

  return (
    <div
      className={`bg-[#131318] border rounded-2xl p-5 ${glows[glowColor]} ${className}`}
    >
      {children}
    </div>
  );
}
