"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "./Button";

export function BackButton() {
  const router = useRouter();

  return (
    <Button type="button" variant="primary" size="sm" onClick={() => router.back()}>
      <ArrowLeft size={16} aria-hidden="true" />
      Back
    </Button>
  );
}