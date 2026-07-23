"use client";

import { BellIcon } from "@/components/svg/BellIcon";

interface NotificationButtonProps {
  permission: NotificationPermission | "default";
  onRequest: () => void;
}

export function NotificationButton({
  permission,
  onRequest,
}: NotificationButtonProps) {
  if (permission === "granted") {
    return (
      <div className="text-success bg-success/10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs">
        <BellIcon className="h-3 w-3" />
        <span className="hidden sm:inline">알림 ON</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="text-danger bg-danger/10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs">
        <BellIcon className="h-3 w-3" />
        <span className="hidden sm:inline">차단됨</span>
      </div>
    );
  }

  return (
    <button
      id="notification-btn"
      onClick={onRequest}
      className="text-warning bg-warning/10 hover:bg-warning/20 flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors"
    >
      <BellIcon className="h-3 w-3" />
      <span className="hidden sm:inline">알림 허용</span>
    </button>
  );
}
