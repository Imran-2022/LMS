"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button, ButtonLink } from "./Button";

export function BackButton({ href }: { href?: string }) {
  const router = useRouter();

  if (href) {
    return (
      <ButtonLink href={href} variant="primary" size="sm">
        <ArrowLeft size={16} aria-hidden="true" />
        Back
      </ButtonLink>
    );
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      onClick={() => router.back()}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      Back
    </Button>
  );
}
