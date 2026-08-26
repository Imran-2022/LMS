"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { ComponentProps } from "react";

import { Input } from "./Input";

type PasswordInputProps = Omit<ComponentProps<typeof Input>, "type" | "value" | "defaultValue" | "onChange">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState("");

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className={className}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="grid h-8 w-8 place-items-center rounded text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
          aria-label={visible ? "Hide password" : "Show password"}
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      }
    />
  );
}