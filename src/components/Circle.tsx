"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { NormalizedObject } from "@/types/normalized";
import { CATEGORY_COLORS } from "@/lib/categories";
import { getShapeForContinent } from "@/lib/continents";
import { ShapeSymbol } from "./ShapeSymbol";

const PREVIEW_WIDTH = 200;
const DESCRIPTION_MAX_LENGTH = 120;

const PLACEHOLDER_COLOR = "#e5e7eb";

interface CircleProps {
  object: NormalizedObject | null;
  size: number;
  returnPage?: number;
  /** When object is null, use this color (e.g. loading state) */
  colorOverride?: string;
}

function truncateDescription(text: string | null): string | null {
  if (!text || !text.trim()) return null;
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (cleaned.length <= DESCRIPTION_MAX_LENGTH) return cleaned;
  return cleaned.slice(0, DESCRIPTION_MAX_LENGTH) + "…";
}

export function Circle({ object, size, returnPage, colorOverride }: CircleProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [popupBelow, setPopupBelow] = useState(true);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isPlaceholder = object === null;
  const color = colorOverride ?? (object ? CATEGORY_COLORS[object.category] : PLACEHOLDER_COLOR);
  const continent = object?.continent ?? "unknown";
  const shape = getShapeForContinent(continent);
  const href = object
    ? (returnPage
        ? `/object/${object.id}?page=${returnPage}`
        : `/object/${object.id}`)
    : "#";
  const dateStr = object?.date.raw || "undated";
  const description = object ? truncateDescription(object.description) : null;

  const handleEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    const rect = wrapperRef.current?.getBoundingClientRect();
    const viewportMid = typeof window !== "undefined" ? window.innerHeight / 2 : 0;
    const dotCenterY = rect ? rect.top + rect.height / 2 : 0;
    setPopupBelow(dotCenterY < viewportMid);
    setShowPreview(true);
  };

  const handleLeave = () => {
    hideTimeoutRef.current = setTimeout(() => setShowPreview(false), 150);
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative flex items-center justify-center transition-transform duration-150 ${!isPlaceholder ? "cursor-pointer hover:scale-125" : ""} ${showPreview ? "z-[100]" : ""}`}
      style={{
        width: size,
        height: size,
        justifySelf: "center",
        alignSelf: "center",
      }}
      onClick={!isPlaceholder ? () => router.push(href) : undefined}
      onMouseEnter={!isPlaceholder ? handleEnter : undefined}
      onMouseLeave={!isPlaceholder ? handleLeave : undefined}
    >
      <ShapeSymbol
        shape={shape}
        color={color}
        size={size}
        className="transition-colors duration-500 ease-out"
      />
      {showPreview && object && (
        <div
          className="absolute z-[1] overflow-hidden rounded-lg bg-white shadow-xl border border-gray-200"
          style={{
            width: PREVIEW_WIDTH,
            ...(popupBelow
              ? { bottom: "auto", top: size + 8 }
              : { top: "auto", bottom: size + 8 }),
            left: "50%",
            transform: "translateX(-50%)",
          }}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {object?.imagePreviewUrl ? (
            <img
              src={object.imagePreviewUrl}
              alt=""
              className="w-full aspect-[4/3] object-cover bg-gray-100"
            />
          ) : (
            <div
              className="w-full aspect-[4/3] flex items-center justify-center"
              style={{ backgroundColor: color, opacity: 0.4 }}
            />
          )}
          <div className="p-2.5 space-y-1">
            <p className="text-sm font-medium text-gray-900 line-clamp-2 overflow-hidden">
              {object?.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span>{object?.categoryLabel}</span>
              <span>·</span>
              <ShapeSymbol
                shape={shape}
                color={color}
                size={10}
                className="shrink-0"
              />
              <span>{object?.continentLabel}</span>
              <span>·</span>
              <span>{dateStr}</span>
            </div>
            {description && (
              <p className="text-xs text-gray-600 line-clamp-3 overflow-hidden pt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
