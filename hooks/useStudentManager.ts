"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SubjectType = "english" | "math" | "science";

export interface ClassSlot {
  label: string;
  subject: SubjectType;
  subjectName: string;
  start: Date;
  end: Date;
}

export interface SubjectCounts {
  english: number;
  math: number;
  science: number;
}

export interface Student {
  id: string;
  name: string;
  arrivalDate: Date;
  numberOfClasses: number;
  subjectCounts: SubjectCounts;
  classSlots: ClassSlot[];
  dismissalTime: Date;
}

export interface StudentDerived {
  elapsedMinutes: number;
  elapsedDisplay: string;
  totalMinutes: number;
  currentClassIndex: number;
  isFinished: boolean;
  isWaiting: boolean;
  progressPercent: number;
}

/* ------------------------------------------------------------------ */
/*  Fast time‑input parser                                             */
/*  "432" + PM → 16:32    "432" + AM → 04:32                          */
/*  "1630" → 16:30 (already 24h, toggle ignored)                      */
/*  "9" + AM → 09:00      "9" + PM → 21:00                            */
/* ------------------------------------------------------------------ */

function parseTimeInput(
  rawHour: string,
  rawMinute: string,
  isAM: boolean,
): { hours: number; minutes: number } | null {
  const hDigits = rawHour.replace(/\D/g, "");
  const mDigits = rawMinute.replace(/\D/g, "");
  if (hDigits.length === 0) return null;

  let hours = parseInt(hDigits, 10);
  const minutes = mDigits.length === 0 ? 0 : parseInt(mDigits, 10);

  if (isNaN(hours) || hours > 23) return null;
  if (isNaN(minutes) || minutes >= 60) return null;

  // Apply AM/PM only when the parsed hour is ≤ 12 (ambiguous)
  if (hours <= 12) {
    if (isAM) {
      // 12 AM → 0 (midnight); 1‑11 stay as‑is
      if (hours === 12) hours = 0;
    } else {
      // PM: 1‑11 → 13‑23; 12 stays 12
      if (hours < 12) hours += 12;
    }
  }

  return { hours, minutes };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/* ------------------------------------------------------------------ */
/*  Schedule builder                                                   */
/* ------------------------------------------------------------------ */

const SUBJECT_ORDER: { key: SubjectType; name: string }[] = [
  { key: "english", name: "영어" },
  { key: "math", name: "수학" },
  { key: "science", name: "과학" },
];

function buildSchedule(
  arrivalDate: Date,
  subjectCounts: SubjectCounts,
): { classSlots: ClassSlot[]; dismissalTime: Date; totalClasses: number } {
  const totalClasses =
    (subjectCounts.english || 0) +
    (subjectCounts.math || 0) +
    (subjectCounts.science || 0);

  const duration = totalClasses >= 3 ? 60 : 70;
  const slots: ClassSlot[] = [];
  let cursor = new Date(arrivalDate.getTime());
  let periodNum = 1;

  for (const { key, name } of SUBJECT_ORDER) {
    const count = subjectCounts[key] || 0;
    for (let i = 0; i < count; i++) {
      const start = new Date(cursor.getTime());
      const end = new Date(cursor.getTime() + duration * 60_000);
      slots.push({
        label: `${periodNum}교시 (${name})`,
        subject: key,
        subjectName: name,
        start,
        end,
      });
      cursor = end;
      periodNum++;
    }
  }

  return {
    classSlots: slots,
    dismissalTime: new Date(cursor.getTime()),
    totalClasses,
  };
}

/* ------------------------------------------------------------------ */
/*  Pure derived‑state computation                                     */
/*  `now` is passed in so this function stays pure (no Date.now())     */
/* ------------------------------------------------------------------ */

export function computeStudentDerived(
  student: Student,
  now: number,
): StudentDerived {
  const diffMs = now - student.arrivalDate.getTime();
  const elapsedMinutes = Math.max(0, Math.floor(diffMs / 60_000));

  let currentClassIndex = -1;
  for (let i = 0; i < student.classSlots.length; i++) {
    if (
      now >= student.classSlots[i].start.getTime() &&
      now < student.classSlots[i].end.getTime()
    ) {
      currentClassIndex = i;
      break;
    }
  }

  const isFinished = now >= student.dismissalTime.getTime();
  const isWaiting = now < student.arrivalDate.getTime();
  if (isFinished) currentClassIndex = -1;

  const totalMinutes = Math.round(
    (student.dismissalTime.getTime() - student.arrivalDate.getTime()) / 60_000,
  );

  const hours = Math.floor(elapsedMinutes / 60);
  const mins = elapsedMinutes % 60;
  const elapsedDisplay = hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;

  const progressPercent =
    totalMinutes > 0 ? Math.min(100, (elapsedMinutes / totalMinutes) * 100) : 0;

  return {
    elapsedMinutes,
    elapsedDisplay,
    totalMinutes,
    currentClassIndex,
    isFinished,
    isWaiting,
    progressPercent,
  };
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

const INITIAL_SUBJECT_COUNTS: SubjectCounts = {
  english: 0,
  math: 0,
  science: 0,
};

export function useStudentManager() {
  const [students, setStudents] = useState<Student[]>([]);

  // The single source of "now" — kept in state so renders stay pure.
  // Updated only inside callbacks / effects, never during render.
  const [currentTime, setCurrentTime] = useState(0);

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  // ---- Form state ----
  const [formName, setFormName] = useState("");
  const [formHourInput, setFormHourInput] = useState("4");
  const [formMinuteInput, setFormMinuteInput] = useState("30");
  const [subjectCounts, setSubjectCounts] = useState<SubjectCounts>(
    INITIAL_SUBJECT_COUNTS,
  );
  const [isAM, setIsAM] = useState(false); // default PM (오후)

  const toggleSubject = useCallback((subject: SubjectType) => {
    setSubjectCounts((prev) => ({
      ...prev,
      [subject]: ((prev[subject] || 0) + 1) % 3,
    }));
  }, []);

  const totalSelectedClasses =
    subjectCounts.english + subjectCounts.math + subjectCounts.science;

  // ---- Refs for stable callbacks ----
  const firedNotifications = useRef<Set<string>>(new Set());
  const studentsRef = useRef<Student[]>([]);
  useEffect(() => {
    studentsRef.current = students;
  }, [students]);

  // ---- Parsed time (reactive, depends on isAM) ----
  const parsed = parseTimeInput(formHourInput, formMinuteInput, isAM);
  const parsedTimeDisplay = parsed
    ? `${String(parsed.hours).padStart(2, "0")}:${String(parsed.minutes).padStart(2, "0")}`
    : null;

  // ---- Initial currentTime (via setTimeout — avoids sync setState in effect) ----
  useEffect(() => {
    const tid = setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => clearTimeout(tid);
  }, []);

  // ---- Notification permission ----
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const tid = setTimeout(
      () => setNotificationPermission(Notification.permission),
      0,
    );
    return () => clearTimeout(tid);
  }, []);

  const requestNotificationPermission = useCallback(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    Notification.requestPermission().then((perm) => {
      setNotificationPermission(perm);
    });
  }, []);

  // ---- Notification checker (uses refs — stable callback) ----
  const checkNotifications = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    )
      return;

    const now = Date.now(); // OK — called from callback, not render
    for (const student of studentsRef.current) {
      for (let i = 0; i < student.classSlots.length; i++) {
        const slot = student.classSlots[i];

        // 1교시 시작(i === 0)은 알람을 주지 않고, 2교시(i === 1), 3교시(i === 2) 등 2교시 이후 시작 시에만 알람 발송
        if (i > 0) {
          const startKey = `${student.id}-${slot.label}-start`;
          if (
            !firedNotifications.current.has(startKey) &&
            now >= slot.start.getTime() &&
            now < slot.start.getTime() + 60_000
          ) {
            firedNotifications.current.add(startKey);
            new Notification(`${student.name} — 수업 알림 🔔`, {
              body: `${slot.label} 시작! (${formatTime(slot.start)})`,
              icon: "/favicon.ico",
            });
          }
        }

        if (i === student.classSlots.length - 1) {
          const endKey = `${student.id}-${slot.label}-end`;
          if (
            !firedNotifications.current.has(endKey) &&
            now >= slot.end.getTime() &&
            now < slot.end.getTime() + 60_000
          ) {
            firedNotifications.current.add(endKey);
            new Notification(`${student.name} — 하원 시간 🎉`, {
              body: `모든 수업이 끝났습니다! (${formatTime(slot.end)})`,
              icon: "/favicon.ico",
            });
          }
        }
      }
    }
  }, []);

  // ---- Interval + Page Visibility API ----
  const hasStudents = students.length > 0;

  useEffect(() => {
    if (!hasStudents) return;

    const tick = () => {
      setCurrentTime(Date.now()); // inside callback — not render
      checkNotifications();
    };

    // Immediate tick via setTimeout (avoids sync setState in effect body)
    const tid = setTimeout(tick, 0);
    const id = setInterval(tick, 10_000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearTimeout(tid);
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hasStudents, checkNotifications]);

  // ---- Add student ----
  const addStudent = useCallback(() => {
    if (!parsed || !formName.trim() || totalSelectedClasses === 0) return;

    const now = new Date(); // event handler — not render
    const arrivalDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parsed.hours,
      parsed.minutes,
      0,
      0,
    );

    const { classSlots, dismissalTime, totalClasses } = buildSchedule(
      arrivalDate,
      subjectCounts,
    );

    const student: Student = {
      id: crypto.randomUUID(),
      name: formName.trim(),
      arrivalDate,
      numberOfClasses: totalClasses,
      subjectCounts,
      classSlots,
      dismissalTime,
    };

    setStudents((prev) => [...prev, student]);
    setCurrentTime(Date.now()); // ensure immediate accurate render
    setFormName("");
    setFormHourInput("4");
    setFormMinuteInput("30");
    setSubjectCounts(INITIAL_SUBJECT_COUNTS);

    requestNotificationPermission();
  }, [
    parsed,
    formName,
    subjectCounts,
    totalSelectedClasses,
    requestNotificationPermission,
  ]);

  // ---- Remove student ----
  const removeStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    const cleaned = new Set<string>();
    firedNotifications.current.forEach((key) => {
      if (!key.startsWith(id)) cleaned.add(key);
    });
    firedNotifications.current = cleaned;
  }, []);

  return {
    students,
    currentTime,
    formName,
    setFormName,
    formHourInput,
    setFormHourInput,
    formMinuteInput,
    setFormMinuteInput,
    subjectCounts,
    toggleSubject,
    isAM,
    setIsAM,
    parsedTimeDisplay,
    canAddStudent:
      parsed !== null && formName.trim().length > 0 && totalSelectedClasses > 0,
    addStudent,
    removeStudent,
    notificationPermission,
    requestNotificationPermission,
  };
}
