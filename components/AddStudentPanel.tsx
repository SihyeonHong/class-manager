"use client";

import { PlusIcon } from "@/components/svg/PlusIcon";
import type { SubjectType, SubjectCounts } from "@/hooks/useStudentManager";

export function AddStudentPanel({
  formName,
  setFormName,
  formHourInput,
  setFormHourInput,
  formMinuteInput,
  setFormMinuteInput,
  subjectCounts,
  onToggleSubject,
  isAM,
  setIsAM,
  parsedTimeDisplay,
  canAddStudent,
  onSubmit,
}: {
  formName: string;
  setFormName: (v: string) => void;
  formHourInput: string;
  setFormHourInput: (v: string) => void;
  formMinuteInput: string;
  setFormMinuteInput: (v: string) => void;
  subjectCounts: SubjectCounts;
  onToggleSubject: (subject: SubjectType) => void;
  isAM: boolean;
  setIsAM: (v: boolean) => void;
  parsedTimeDisplay: string | null;
  canAddStudent: boolean;
  onSubmit: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canAddStudent) {
      e.preventDefault();
      onSubmit();
    }
  };

  const subjectOptions: {
    key: SubjectType;
    label: string;
    activeStyle: string;
    activeText: string;
    hoverBorder: string;
  }[] = [
    {
      key: "english",
      label: "영어",
      activeStyle: "border-primary bg-primary/10",
      activeText: "text-primary-light font-bold",
      hoverBorder: "hover:border-primary/40",
    },
    {
      key: "math",
      label: "수학",
      activeStyle: "border-secondary bg-secondary/10",
      activeText: "text-secondary-light font-bold",
      hoverBorder: "hover:border-secondary/40",
    },
    {
      key: "science",
      label: "과학",
      activeStyle: "border-tertiary bg-tertiary/10",
      activeText: "text-tertiary-light font-bold",
      hoverBorder: "hover:border-tertiary/40",
    },
  ];

  const getSubLabel = (count: number) => {
    if (count === 1) return "1교시";
    if (count === 2) return "연속 2교시";
    return "미선택";
  };

  return (
    <aside className="animate-fade-in-up w-full shrink-0 lg:w-72">
      <div className="glass-card p-4 lg:sticky lg:top-5">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-primary/15 text-primary-light flex h-7 w-7 items-center justify-center rounded-lg">
            <PlusIcon className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-foreground text-sm font-semibold">학생 등록</h2>
        </div>

        {/* Name */}
        <div className="mb-2.5">
          <label
            htmlFor="student-name"
            className="text-muted mb-1 block text-xs font-medium"
          >
            학생 이름
          </label>
          <input
            id="student-name"
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="이름 입력"
            className="bg-background border-glass-border text-foreground placeholder:text-muted/40 w-full rounded-lg border px-2.5 py-2 text-sm transition-all duration-200"
          />
        </div>

        {/* Time input */}
        <div className="mb-2.5">
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="hour-input"
              className="text-muted text-xs font-medium"
            >
              시작 시간
            </label>
            {parsedTimeDisplay && (
              <span className="text-primary-light font-mono text-xs font-bold">
                → {parsedTimeDisplay}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <input
                  id="hour-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={formHourInput}
                  onChange={(e) => setFormHourInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="시"
                  className="bg-background border-glass-border text-foreground placeholder:text-muted/40 w-full rounded-lg border px-2 py-2 text-right font-mono text-sm transition-all duration-200"
                />
                <span className="text-muted shrink-0 text-xs font-medium">
                  시
                </span>
              </div>
              <div className="flex min-w-0 flex-1 items-center gap-1">
                <input
                  id="minute-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  value={formMinuteInput}
                  onChange={(e) => setFormMinuteInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="분"
                  className="bg-background border-glass-border text-foreground placeholder:text-muted/40 w-full rounded-lg border px-2 py-2 text-right font-mono text-sm transition-all duration-200"
                />
                <span className="text-muted shrink-0 text-xs font-medium">
                  분
                </span>
              </div>
            </div>

            {/* AM / PM toggle */}
            <div
              className="border-glass-border flex shrink-0 overflow-hidden rounded-lg border"
              role="radiogroup"
              aria-label="오전/오후 선택"
            >
              <button
                id="toggle-am"
                type="button"
                role="radio"
                aria-checked={isAM}
                onClick={() => setIsAM(true)}
                className={`cursor-pointer px-2.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  isAM
                    ? "bg-primary/15 text-primary-light"
                    : "text-muted hover:bg-card-hover hover:text-foreground"
                }`}
              >
                오전
              </button>
              <div className="bg-glass-border w-px" />
              <button
                id="toggle-pm"
                type="button"
                role="radio"
                aria-checked={!isAM}
                onClick={() => setIsAM(false)}
                className={`cursor-pointer px-2.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  !isAM
                    ? "bg-primary/15 text-primary-light"
                    : "text-muted hover:bg-card-hover hover:text-foreground"
                }`}
              >
                오후
              </button>
            </div>
          </div>
        </div>

        {/* Subject selection */}
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between">
            <label className="text-muted block text-xs font-medium">
              과목 선택
            </label>
            <span className="text-2xs text-muted/70">클릭 시 교시 수 변경</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {subjectOptions.map((opt) => {
              const count = subjectCounts[opt.key] || 0;
              const isSelected = count > 0;
              return (
                <button
                  key={opt.key}
                  id={`subject-${opt.key}`}
                  type="button"
                  onClick={() => onToggleSubject(opt.key)}
                  className={`relative flex cursor-pointer flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 text-center transition-all duration-200 select-none ${
                    isSelected
                      ? opt.activeStyle
                      : `border-glass-border bg-background/50 ${opt.hoverBorder}`
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? opt.activeText : "text-foreground"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={`text-2xs ${
                      isSelected ? opt.activeText : "text-muted"
                    }`}
                  >
                    {getSubLabel(count)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          id="add-student-btn"
          disabled={!canAddStudent}
          onClick={onSubmit}
          className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
            canAddStudent
              ? "bg-primary hover:bg-primary/90 shadow-primary/20 text-white shadow-md active:scale-[0.98]"
              : "bg-card text-muted cursor-not-allowed"
          }`}
        >
          <PlusIcon className="h-4 w-4" />
          학생 추가
        </button>
      </div>
    </aside>
  );
}
