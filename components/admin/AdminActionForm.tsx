"use client";

import { ComponentProps, useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AdminActionFormProps = Omit<ComponentProps<"form">, "action"> & {
  action: (formData: FormData) => Promise<void>;
  successMessage?: string;
};

export function AdminActionForm({
  action,
  children,
  successMessage = "Changes saved.",
  ...props
}: AdminActionFormProps) {
  const router = useRouter();
  const [, formAction, pending] = useActionState(
    async (_state: null, formData: FormData) => {
      try {
        await action(formData);
        toast.success(successMessage);
        router.refresh();
        return null;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "The action could not be completed.");
        return null;
      }
    },
    null,
  );

  return (
    <form
      {...props}
      action={formAction}
    >
      <fieldset className="contents" disabled={pending} aria-busy={pending}>
        {children}
      </fieldset>
    </form>
  );
}
