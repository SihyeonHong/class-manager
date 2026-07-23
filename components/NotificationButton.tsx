"use client";

import { BellIcon } from "@/components/svg/BellIcon";

interface NotificationButtonProps {
  permission: NotificationPermission | "default";
  onRequest: () => void;
}

export function NotificationButton({ permission, onRequest }: NotificationButtonProps) {
  if (permission === "granted") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs text-success">
        <BellIcon className="h-3 w-3" />
        <span className="hidden sm:inline">알림 ON</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs text-danger">
        <BellIcon className="h-3 w-3" />
        <span className="hidden sm:inline">차단됨</span>
      </div>
    );
  }

  return (
    <button
      id="notification-btn"
      onClick={onRequest}
      className="flex cursor-pointer items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs text-warning transition-colors hover:bg-warning/20"
    >
      <BellIcon className="h-3 w-3" />
      <span className="hidden sm:inline">알림 허용</span>
    </button>
  );
}
