"use client";

import { useState, useEffect } from "react";

import { ClockIcon } from "@/components/svg/ClockIcon";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CurrentTime() {
  const [display, setDisplay] = useState({ date: "", time: "" });

  useEffect(() => {
    const format = () => {
      const now = new Date();
      const date = `${now.getMonth() + 1}월 ${now.getDate()}일 (${DAYS[now.getDay()]})`;
      const time = now.toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      return { date, time };
    };

    const tid = setTimeout(() => setDisplay(format()), 0);
    const id = setInterval(() => setDisplay(format()), 1000);

    return () => {
      clearTimeout(tid);
      clearInterval(id);
    };
  }, []);

  if (!display.time) return null;

  return (
    <div className="flex items-center gap-2 font-mono text-sm text-muted">
      <span>{display.date}</span>
      <ClockIcon className="h-4 w-4" />
      <span>{display.time}</span>
    </div>
  );
}
