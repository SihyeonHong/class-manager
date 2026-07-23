"use client";

import { CurrentTime } from "@/components/CurrentTime";
import { NotificationButton } from "@/components/NotificationButton";
import { ClockIcon } from "@/components/svg/ClockIcon";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  notificationPermission: NotificationPermission | "default";
  onRequestNotificationPermission: () => void;
}

export function Header({
  notificationPermission,
  onRequestNotificationPermission,
}: HeaderProps) {
  return (
    <header className="border-glass-border relative z-10 border-b">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary shadow-primary/20 flex h-9 w-9 items-center justify-center rounded-xl shadow-md">
            <ClockIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-foreground text-base font-bold">
              클래스 매니저
            </h1>
            <p className="text-2xs text-muted tracking-widest uppercase">
              Class Time Manager
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CurrentTime />
          <NotificationButton
            permission={notificationPermission}
            onRequest={onRequestNotificationPermission}
          />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
