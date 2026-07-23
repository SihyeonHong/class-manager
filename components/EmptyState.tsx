import { InboxIcon } from "@/components/svg/InboxIcon";

export function EmptyState() {
  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center py-16">
      <div className="bg-primary/8 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
        <InboxIcon className="text-primary-light/40 h-8 w-8" />
      </div>
      <p className="text-muted text-sm font-medium">등록된 학생이 없습니다</p>
      <p className="text-muted/60 mt-1 text-xs">
        오른쪽 패널에서 학생을 추가해 주세요
      </p>
    </div>
  );
}
