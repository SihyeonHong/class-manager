"use client";

import { AddStudentPanel } from "@/components/AddStudentPanel";
import { EmptyState } from "@/components/EmptyState";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StudentCard } from "@/components/StudentCard";
import { SummaryBar } from "@/components/SummaryBar";
import { useStudentManager } from "@/hooks/useStudentManager";

export default function Home() {
  const mgr = useStudentManager();

  // Sort: earliest dismissal time first (하원 시간 순)
  const sorted = [...mgr.students].sort((a, b) => {
    const diff = a.dismissalTime.getTime() - b.dismissalTime.getTime();
    if (diff !== 0) return diff;
    return a.arrivalDate.getTime() - b.arrivalDate.getTime();
  });

  return (
    <div className="noise relative flex min-h-screen flex-col">
      {/* Header */}
      <Header
        notificationPermission={mgr.notificationPermission}
        onRequestNotificationPermission={mgr.requestNotificationPermission}
      />

      {/* Main content — two-column layout */}
      <main className="relative z-10 mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          {/* Left — cards */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {/* Summary bar */}
            {mgr.students.length > 0 && (
              <SummaryBar students={mgr.students} currentTime={mgr.currentTime} />
            )}

            {/* Student cards grid — 4 per row on xl */}
            {mgr.students.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sorted.map((student) => (
                  <StudentCard
                    key={student.id}
                    student={student}
                    currentTime={mgr.currentTime}
                    onRemove={() => mgr.removeStudent(student.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — Add Student Panel */}
          <AddStudentPanel
            formName={mgr.formName}
            setFormName={mgr.setFormName}
            formHourInput={mgr.formHourInput}
            setFormHourInput={mgr.setFormHourInput}
            formMinuteInput={mgr.formMinuteInput}
            setFormMinuteInput={mgr.setFormMinuteInput}
            subjectCounts={mgr.subjectCounts}
            onToggleSubject={mgr.toggleSubject}
            isAM={mgr.isAM}
            setIsAM={mgr.setIsAM}
            parsedTimeDisplay={mgr.parsedTimeDisplay}
            canAddStudent={mgr.canAddStudent}
            onSubmit={mgr.addStudent}
          />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
