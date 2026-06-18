import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-4",
        hover && "glass-hover cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}
