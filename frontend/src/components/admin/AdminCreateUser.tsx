"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { createUser } from "@/lib/actions/admin";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FormError, Input, Select } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function AdminCreateUser() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(createUser, {});

  useEffect(() => {
    if (!state.success) return;
    setOpen(false);
    router.refresh();
  }, [router, state.success]);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        Create User
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Create user"
        description="Create an account using the same details required during signup."
        placement="center"
        size="md"
      >
        <form action={action} className="space-y-4">
          <FormError>{state.error}</FormError>
          <Input label="Full name" name="fullName" type="text" autoComplete="name" defaultValue={state.values?.fullName} placeholder="Full name" maxLength={120} required />
          <Input label="Mobile number" name="mobileNumber" type="tel" autoComplete="tel" defaultValue={state.values?.mobileNumber} placeholder="E.g +88017712078**" inputMode="tel" required />
          <Input label="Email" name="email" type="email" autoComplete="email" defaultValue={state.values?.email} placeholder="you@example.com" required />
          <PasswordInput label="Password" name="password" autoComplete="new-password" placeholder="Enter a password" minLength={8} required />
          <PasswordInput label="Confirm password" name="confirmPassword" autoComplete="new-password" placeholder="Re-enter the password" minLength={8} required />
          <Select label="Account type" name="role" defaultValue={state.values?.role ?? ROLES.STUDENT} required>
            {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </Select>
          <div className="flex justify-end gap-2 border-t border-ink-100 pt-4">
            <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton size="sm" pendingLabel="Creating...">Create user</SubmitButton>
          </div>
        </form>
      </Dialog>
    </>
  );
}