"use client";

import type { ReactNode } from "react";

import { terminalStageConfirmMessage } from "@/lib/application-board";
import type { ApplicationStatusValue } from "@/lib/validation/application";
import { changeStatusAction } from "@/server/actions/applications";

export function StatusChangeForm({
  applicationId,
  status,
  className,
  children,
}: {
  applicationId: string;
  status: ApplicationStatusValue;
  className?: string;
  children: ReactNode;
}) {
  const message = terminalStageConfirmMessage(status);

  return (
    <form
      action={changeStatusAction}
      className={className}
      onSubmit={(event) => {
        if (message && !window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="status" value={status} />
      {children}
    </form>
  );
}
