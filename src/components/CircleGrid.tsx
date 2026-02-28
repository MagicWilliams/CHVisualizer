'use client';

import { useRef, useState, useEffect } from 'react';
import type { NormalizedObject } from '@/types/normalized';
import { ITEMS_PER_PAGE } from '@/lib/constants';
import { Circle } from './Circle';
const PLACEHOLDER_COLOR = '#e5e7eb';
const COLUMN_GAP_VW = 0.4;
const ROW_GAP_VH = 4.4;

interface CircleGridProps {
  objects: NormalizedObject[];
  isLoading: boolean;
  returnPage?: number;
}

export function CircleGrid({
  objects,
  isLoading,
  returnPage,
}: CircleGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [circleSize, setCircleSize] = useState(8);
  const [gridLayout, setGridLayout] = useState({ cols: 25, rows: 10 });
  const [rowGapPx, setRowGapPx] = useState(24);
  const [columnGapPx, setColumnGapPx] = useState(8);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      const rowGap = vh * (ROW_GAP_VH / 100);
      const columnGap = vw * (COLUMN_GAP_VW / 100);
      setRowGapPx(rowGap);
      setColumnGapPx(columnGap);

      const count = ITEMS_PER_PAGE;
      const cols = Math.max(1, Math.floor(Math.sqrt(count * (width / height))));
      const rows = Math.ceil(count / cols);
      const cellW = (width - (cols - 1) * columnGap) / cols;
      const cellH = (height - (rows - 1) * rowGap) / rows;
      const size = Math.min(cellW, cellH) * 0.9;
      const viewportMin = Math.min(width, height);
      // Use a higher minimum on small viewports so icons stay readable on mobile
      const minSize =
        viewportMin >= 768 ? 4 : Math.min(12, Math.max(8, 4 + (768 - viewportMin) / 60));
      setCircleSize(Math.max(minSize, Math.min(size, 24)));
      setGridLayout({ cols, rows });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    const handleResize = () => updateSize();
    window.addEventListener('resize', handleResize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
    gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
    gridAutoFlow: 'column',
    columnGap: columnGapPx,
    rowGap: rowGapPx,
  } as React.CSSProperties;

  // Use index-based keys so React keeps DOM elements in place when switching
  // between loading and loaded states, enabling smooth color transitions
  const itemCount = isLoading ? ITEMS_PER_PAGE : objects.length;
  const gridContent = Array.from({ length: itemCount }).map((_, i) => {
    const obj = isLoading ? null : (objects[i] ?? null);
    return (
      <Circle
        key={i}
        object={obj}
        size={circleSize}
        returnPage={returnPage}
        colorOverride={isLoading ? PLACEHOLDER_COLOR : undefined}
      />
    );
  });

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 w-full overflow-hidden flex"
    >
      <div className="w-full h-full min-w-0 min-h-0" style={gridStyle}>
        {gridContent}
      </div>
    </div>
  );
}
