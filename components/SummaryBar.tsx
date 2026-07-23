import { CheckCircleIcon } from "@/components/svg/CheckCircleIcon";
import { UsersIcon } from "@/components/svg/UsersIcon";
import { computeStudentDerived } from "@/hooks/useStudentManager";
import type { Student } from "@/hooks/useStudentManager";

interface SummaryBarProps {
  students: Student[];
  currentTime: number;
}

export function SummaryBar({ students, currentTime }: SummaryBarProps) {
  const inClass = students.filter((s) => {
    const d = computeStudentDerived(s, currentTime);
    return !d.isFinished && !d.isWaiting;
  }).length;
  const finished = students.filter((s) => currentTime >= s.dismissalTime.getTime()).length;

  return (
    <div className="animate-fade-in-up flex items-center gap-4 rounded-xl bg-card/60 px-4 py-2.5 text-xs">
      <div className="flex items-center gap-1.5 text-foreground">
        <UsersIcon className="h-3.5 w-3.5 text-primary-light" />
        <span className="font-semibold">{students.length}</span>
        <span className="text-muted">명</span>
      </div>
      <div className="h-3 w-px bg-glass-border" />
      <div className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary-light" />
        <span className="text-muted">수업 중</span>
        <span className="font-semibold text-secondary-light">{inClass}</span>
      </div>
      <div className="h-3 w-px bg-glass-border" />
      <div className="flex items-center gap-1.5">
        <CheckCircleIcon className="h-3 w-3 text-outdated" />
        <span className="text-muted">귀가</span>
        <span className="font-semibold text-outdated">{finished}</span>
      </div>
    </div>
  );
}
