"use client";

import { useFormStatus } from "react-dom";

import { completeFollowUpAction } from "@/server/actions/workspace";

export function CompleteFollowUpButton({
  followUpId,
  applicationId,
}: {
  followUpId: string;
  applicationId: string;
}) {
  return (
    <form action={completeFollowUpAction}>
      <input type="hidden" name="followUpId" value={followUpId} />
      <input type="hidden" name="applicationId" value={applicationId} />
      <CompleteButton />
    </form>
  );
}

function CompleteButton() {
  const { pending } = useFormStatus();
  return (
    <button className="text-sm font-medium text-accent" disabled={pending}>
      {pending ? "Saving…" : "Complete"}
    </button>
  );
}
