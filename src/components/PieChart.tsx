"use client";

import { useState } from "react";

export interface PieChartItem {
  id?: string;
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartItem[];
  title: string;
  subtitle?: string;
  emptyText?: string;
  size?: number;
}

export function PieChart({
  data,
  title,
  subtitle,
  emptyText = "Nenhum dado registrado",
  size = 200,
}: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.value, 0);

  // SVG dimensions
  const center = size / 2;
  const outerRadius = size * 0.42;
  const innerRadius = size * 0.26;

  // Compute angles for donut slices
  let cumulativeAngle = -90; // Start at 12 o'clock

  const slices = data
    .filter((item) => item.value > 0)
    .map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const isSingleSlice = data.filter((d) => d.value > 0).length === 1;

      // Coordinates helper
      const getCoordinates = (radius: number, degrees: number) => {
        const radians = (degrees * Math.PI) / 180;
        return {
          x: center + radius * Math.cos(radians),
          y: center + radius * Math.sin(radians),
        };
      };

      const isHovered = hoveredIndex === index;
      const currentOuterRadius = isHovered ? outerRadius + 4 : outerRadius;

      // Outer arc
      const p1 = getCoordinates(currentOuterRadius, startAngle);
      const p2 = getCoordinates(currentOuterRadius, endAngle);
      // Inner arc
      const p3 = getCoordinates(innerRadius, endAngle);
      const p4 = getCoordinates(innerRadius, startAngle);

      const largeArcFlag = angle > 180 ? 1 : 0;

      let pathData = "";
      if (isSingleSlice) {
        // Complete circle path
        pathData = `
          M ${center} ${center - currentOuterRadius}
          A ${currentOuterRadius} ${currentOuterRadius} 0 1 1 ${center} ${center + currentOuterRadius}
          A ${currentOuterRadius} ${currentOuterRadius} 0 1 1 ${center} ${center - currentOuterRadius}
          M ${center} ${center - innerRadius}
          A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center + innerRadius}
          A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius}
          Z
        `;
      } else {
        pathData = [
          `M ${p1.x} ${p1.y}`,
          `A ${currentOuterRadius} ${currentOuterRadius} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
          `L ${p3.x} ${p3.y}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
          "Z",
        ].join(" ");
      }

      return {
        ...item,
        index,
        percentage: Number(percentage.toFixed(1)),
        pathData,
        isHovered,
      };
    });

  const activeItem = hoveredIndex !== null ? slices.find((s) => s.index === hoveredIndex) : null;

  return (
    <div className="bg-[#12121a] border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400">
            {total} {total === 1 ? "registro" : "registros"}
          </span>
        </h3>
        {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
      </div>

      {total > 0 && slices.length > 0 ? (
        <div className="flex flex-col sm:flex-row items-center gap-6 my-auto">
          {/* Donut SVG */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="overflow-visible"
            >
              {slices.map((slice) => (
                <path
                  key={slice.label}
                  d={slice.pathData}
                  fill={slice.color}
                  className="transition-all duration-200 cursor-pointer opacity-90 hover:opacity-100"
                  style={{
                    filter: slice.isHovered
                      ? `drop-shadow(0 0 10px ${slice.color})`
                      : "none",
                  }}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </svg>

            {/* Donut Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
              {activeItem ? (
                <>
                  <span className="text-lg font-extrabold text-white leading-tight">
                    {activeItem.percentage}%
                  </span>
                  <span className="text-[10px] text-zinc-300 max-w-[80px] truncate font-medium">
                    {activeItem.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold">
                    ({activeItem.value})
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl font-extrabold text-zinc-100">
                    {total}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    Total
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex-1 w-full max-h-48 overflow-y-auto space-y-2 pr-1">
            {slices.map((slice) => (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between text-xs p-2 rounded-xl transition-all cursor-pointer ${
                  slice.isHovered
                    ? "bg-zinc-800/80 text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate">{slice.label}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0 text-[11px] ml-2">
                  <span className="font-bold text-zinc-200">{slice.value}</span>
                  <span className="text-zinc-500 w-10 text-right">
                    {slice.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-3">
            <span className="text-xl opacity-60">📊</span>
          </div>
          <p className="text-xs font-semibold text-zinc-400">{emptyText}</p>
          <p className="text-[11px] text-zinc-600 mt-1 max-w-xs">
            Conforme você registrar suas sessões de leitura, as porcentagens aparecerão aqui.
          </p>
        </div>
      )}
    </div>
  );
}
