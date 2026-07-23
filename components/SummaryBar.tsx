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
  const finished = students.filter(
    (s) => currentTime >= s.dismissalTime.getTime(),
  ).length;

  return (
    <div className="bg-card/60 animate-fade-in-up flex items-center gap-4 rounded-xl px-4 py-2.5 text-xs">
      <div className="text-foreground flex items-center gap-1.5">
        <UsersIcon className="text-primary-light h-3.5 w-3.5" />
        <span className="font-semibold">{students.length}</span>
        <span className="text-muted">명</span>
      </div>
      <div className="bg-glass-border h-3 w-px" />
      <div className="flex items-center gap-1.5">
        <span className="bg-secondary-light h-1.5 w-1.5 animate-pulse rounded-full" />
        <span className="text-muted">수업 중</span>
        <span className="text-secondary-light font-semibold">{inClass}</span>
      </div>
      <div className="bg-glass-border h-3 w-px" />
      <div className="flex items-center gap-1.5">
        <CheckCircleIcon className="text-outdated h-3 w-3" />
        <span className="text-muted">귀가</span>
        <span className="text-outdated font-semibold">{finished}</span>
      </div>
    </div>
  );
}
