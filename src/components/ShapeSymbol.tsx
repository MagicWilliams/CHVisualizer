"use client";

import type { ShapeType } from "@/lib/continents";

const CLIP_PATHS: Record<Exclude<ShapeType, "x">, string> = {
  circle: "",
  square: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
  triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  pentagon: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
  hexagon: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
};

interface ShapeSymbolProps {
  shape: ShapeType;
  color: string;
  size: number;
  className?: string;
}

export function ShapeSymbol({
  shape,
  color,
  size,
  className = "",
}: ShapeSymbolProps) {
  if (shape === "x") {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        aria-hidden
      >
        <path
          d="M4 4 L20 20 M20 4 L4 20"
          stroke={color}
          strokeWidth={Math.max(1.5, size / 8)}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const clipPath = CLIP_PATHS[shape];
  const isCircle = shape === "circle";

  return (
    <div
      className={isCircle ? `rounded-full ${className}` : className}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        ...(clipPath ? { clipPath } : {}),
      }}
      aria-hidden
    />
  );
}
