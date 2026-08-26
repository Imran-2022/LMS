"use server";

import { cookies } from "next/headers";

import { SIDEBAR_COOKIE } from "@/lib/sidebar-preference";

export async function setSidebarPreference(collapsed: boolean) {
  (await cookies()).set(SIDEBAR_COOKIE, String(collapsed), {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
}