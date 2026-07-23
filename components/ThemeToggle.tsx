"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { MonitorIcon } from "@/components/svg/MonitorIcon";
import { MoonIcon } from "@/components/svg/MoonIcon";
import { SunIcon } from "@/components/svg/SunIcon";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const options = [
    { value: "light", label: "라이트 모드", icon: SunIcon },
    { value: "dark", label: "다크 모드", icon: MoonIcon },
    { value: "system", label: "시스템 모드", icon: MonitorIcon },
  ] as const;

  if (!mounted) {
    return (
      <div className="bg-card/50 border-glass-border h-8.5 w-22 animate-pulse rounded-lg border" />
    );
  }

  const currentTheme = theme || "system";

  return (
    <div
      className="bg-card/60 border-glass-border flex shrink-0 items-center rounded-lg border p-0.5 shadow-sm"
      role="radiogroup"
      aria-label="테마 선택"
    >
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSelected = currentTheme === opt.value;
        return (
          <button
            key={opt.value}
            id={`theme-btn-${opt.value}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            title={opt.label}
            aria-label={opt.label}
            onClick={() => setTheme(opt.value)}
            className={`cursor-pointer rounded-md p-1.5 transition-all duration-200 ${
              isSelected
                ? "bg-primary/15 text-primary-light shadow-xs"
                : "text-muted hover:text-foreground hover:bg-card-hover"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
