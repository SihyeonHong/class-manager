"use client";

import { useState } from "react";

import { CheckCircleIcon } from "@/components/svg/CheckCircleIcon";
import { TrashIcon } from "@/components/svg/TrashIcon";
import type { Student, SubjectType } from "@/hooks/useStudentManager";
import { computeStudentDerived } from "@/hooks/useStudentManager";

function fmt(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const subjectThemes: Record<
  SubjectType,
  {
    color: string;
    bg: string;
    border: string;
    dot: string;
    dotGlow: string;
    progress: string;
    cardBorder: string;
    badge: string;
  }
> = {
  english: {
    // 주황색 (Primary)
    color: "text-primary-light",
    bg: "bg-primary/10",
    border: "border border-primary/20",
    dot: "bg-primary",
    dotGlow: "shadow-primary-glow",
    progress: "bg-primary",
    cardBorder: "border-primary/20",
    badge: "text-primary-light bg-primary/15",
  },
  math: {
    // 초록색 (Secondary)
    color: "text-secondary-light",
    bg: "bg-secondary/10",
    border: "border border-secondary/20",
    dot: "bg-secondary",
    dotGlow: "shadow-secondary-glow",
    progress: "bg-secondary",
    cardBorder: "border-secondary/20",
    badge: "text-secondary-light bg-secondary/15",
  },
  science: {
    // 파란색 (Tertiary)
    color: "text-tertiary-light",
    bg: "bg-tertiary/10",
    border: "border border-tertiary/20",
    dot: "bg-tertiary",
    dotGlow: "shadow-tertiary-glow",
    progress: "bg-tertiary",
    cardBorder: "border-tertiary/20",
    badge: "text-tertiary-light bg-tertiary/15",
  },
};

export function StudentCard({
  student,
  currentTime,
  onRemove,
}: {
  student: Student;
  currentTime: number;
  onRemove: () => void;
}) {
  const d = computeStudentDerived(student, currentTime);
  const [confirmDelete, setConfirmDelete] = useState(false);

  let statusLabel: string;
  let statusColor: string;
  let statusBg: string;
  let statusBorder: string;
  let dotColor: string;
  let elapsedColor: string;
  let cardBorder: string;

  if (d.isFinished) {
    statusLabel = "귀가";
    statusColor = "text-outdated";
    statusBg = "bg-progress-track";
    statusBorder = "border border-glass-border";
    dotColor = "";
    elapsedColor = "text-outdated";
    cardBorder = "border-finished-border bg-finished-bg opacity-90";
  } else if (d.isWaiting) {
    statusLabel = "시작 전";
    statusColor = "text-waiting";
    statusBg = "bg-waiting/10";
    statusBorder = "border border-waiting/20";
    dotColor = "bg-waiting";
    elapsedColor = "text-waiting";
    cardBorder = "border-waiting/15";
  } else {
    statusLabel = "수업 중";
    const currentSlot = student.classSlots[d.currentClassIndex];
    const theme = currentSlot ? subjectThemes[currentSlot.subject] : subjectThemes.english;

    statusColor = theme.color;
    statusBg = theme.bg;
    statusBorder = theme.border;
    dotColor = theme.dot;
    elapsedColor = theme.color;
    cardBorder = theme.cardBorder;
  }

  return (
    <div className={`glass-card animate-scale-in p-3.5 transition-all duration-300 ${cardBorder}`}>
      {/* ---- Header: Name + Elapsed + Status + Delete (single row) ---- */}
      <div className="mb-2 flex items-center gap-2">
        <span className="min-w-0 truncate text-base font-bold text-foreground">{student.name}</span>
        <span className={`shrink-0 font-mono text-sm font-bold ${elapsedColor}`}>
          {d.elapsedMinutes}분 경과
        </span>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-2xs font-medium ${statusColor} ${statusBg} ${statusBorder}`}
        >
          {!d.isFinished && dotColor && (
            <span
              className={`h-1.5 w-1.5 rounded-full ${dotColor} ${
                d.isWaiting ? "" : "animate-pulse"
              }`}
            />
          )}
          {d.isFinished && <CheckCircleIcon className="h-3 w-3 text-outdated" />}
          {statusLabel}
        </span>

        <div className="ml-auto shrink-0">
          {confirmDelete ? (
            <div className="animate-scale-in flex items-center gap-1">
              <button
                onClick={onRemove}
                className="cursor-pointer rounded-md bg-danger/10 px-1.5 py-0.5 text-2xs font-medium text-danger transition-colors hover:bg-danger/20"
              >
                삭제
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="cursor-pointer rounded-md bg-card px-1.5 py-0.5 text-2xs font-medium text-muted transition-colors hover:bg-card-hover"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="cursor-pointer rounded-lg p-1 text-muted transition-all hover:bg-danger/10 hover:text-danger"
              title="삭제"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ---- Info + Multi-Segmented Progress Bar ---- */}
      <div className="mb-2.5">
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted">
          <span>
            시작 {fmt(student.arrivalDate)} ({student.numberOfClasses}교시)
          </span>
          <span>종료 {fmt(student.dismissalTime)}</span>
        </div>
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-progress-track">
          {student.classSlots.map((slot, i) => {
            const start = slot.start.getTime();
            const end = slot.end.getTime();
            const duration = end - start;

            let pct = 0;
            if (d.isFinished) {
              pct = 100;
            } else if (!d.isWaiting && duration > 0) {
              if (currentTime >= end) {
                pct = 100;
              } else if (currentTime > start) {
                pct = Math.min(100, Math.max(0, ((currentTime - start) / duration) * 100));
              }
            }

            const fillBg = subjectThemes[slot.subject]?.progress || "bg-primary";
            const segWidth = 100 / student.classSlots.length;
            const leftPos = i * segWidth;
            const filledWidth = (pct / 100) * segWidth;

            return (
              <div
                key={`${slot.label}-${i}`}
                className={`absolute inset-y-0 transition-all duration-1000 ease-out ${fillBg}`}
                style={{
                  left: `${leftPos}%`,
                  width: `${filledWidth}%`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ---- Compact Schedule ---- */}
      <div className="space-y-1">
        {student.classSlots.map((slot, i) => {
          const isCurrent = d.currentClassIndex === i;
          const isPast = d.isFinished || d.currentClassIndex > i;
          const slotTheme = subjectThemes[slot.subject] || subjectThemes.english;

          return (
            <div
              key={`${slot.label}-${i}`}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs transition-all duration-200 ${
                isCurrent ? `${slotTheme.bg} ${slotTheme.border}` : "bg-transparent"
              }`}
            >
              <div
                className={`h-2 w-2 shrink-0 rounded-full transition-all ${
                  isCurrent
                    ? `${slotTheme.dot} ${slotTheme.dotGlow}`
                    : isPast
                      ? "bg-outdated"
                      : "bg-muted/30"
                }`}
              />
              <span
                className={`min-w-0 font-medium ${
                  isCurrent ? slotTheme.color : isPast ? "text-outdated" : "text-foreground/70"
                }`}
              >
                {slot.label}
              </span>
              <span
                className={`ml-auto shrink-0 font-mono ${
                  isPast ? "text-outdated" : "text-foreground/60"
                }`}
              >
                {fmt(slot.start)}–{fmt(slot.end)}
              </span>
              {isCurrent && (
                <span
                  className={`shrink-0 animate-pulse rounded-full px-1.5 py-0.5 text-2xs font-medium ${slotTheme.badge}`}
                >
                  진행 중
                </span>
              )}
              {isPast && <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-outdated" />}
            </div>
          );
        })}

        {/* Dismissal */}
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs">
          <div
            className={`h-2 w-2 shrink-0 rounded-full ${
              d.isFinished ? "bg-outdated" : "bg-muted/30"
            }`}
          />
          <span
            className={`min-w-0 font-medium ${
              d.isFinished ? "text-outdated" : "text-foreground/70"
            }`}
          >
            귀가
          </span>
          <span
            className={`ml-auto shrink-0 font-mono ${d.isFinished ? "text-outdated" : "text-foreground/60"}`}
          >
            {fmt(student.dismissalTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
