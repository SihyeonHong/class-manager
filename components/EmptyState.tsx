import { InboxIcon } from "@/components/svg/InboxIcon";

export function EmptyState() {
  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
        <InboxIcon className="h-8 w-8 text-primary-light/40" />
      </div>
      <p className="text-sm font-medium text-muted">등록된 학생이 없습니다</p>
      <p className="mt-1 text-xs text-muted/60">오른쪽 패널에서 학생을 추가해 주세요</p>
    </div>
  );
}
