"use client";

import { CurrentTime } from "@/components/CurrentTime";
import { NotificationButton } from "@/components/NotificationButton";
import { ClockIcon } from "@/components/svg/ClockIcon";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  notificationPermission: NotificationPermission | "default";
  onRequestNotificationPermission: () => void;
}

export function Header({ notificationPermission, onRequestNotificationPermission }: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-glass-border">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
            <ClockIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">클래스 매니저</h1>
            <p className="text-2xs tracking-widest text-muted uppercase">Class Manager</p>
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
