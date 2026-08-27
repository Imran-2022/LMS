/**
 * Dashboard navigation, as data.
 *
 * The sidebar is built from the role rather than from a pile of conditionals in JSX,
 * so "what can this role reach" is one readable list per role instead of something you
 * have to reverse-engineer from nested `&&`s in a component.
 *
 * The `roles` field on each item mirrors the assignment's permission matrix. As with
 * everything on the frontend it is presentation only — omitting a link does not
 * protect the route. The route is protected by `requireRole()` in its layout and by
 * the Strapi policy on every request it makes.
 */
import type { RoleType } from "./types";

/** Icon names, resolved to components in `Sidebar.tsx`. Kept as strings so this file
 *  stays free of JSX and can be imported from anywhere, client or server. */
export type NavIcon =
  | "library"
  | "compass"
  | "book"
  | "award"
  | "users"
  | "pen"
  | "layers"
  | "chart";

export type NavItem = {
  label: string;
  href: string;
  icon: NavIcon;
  roles: RoleType[];
  /** Match child routes too (`/manage/courses/3` highlights "Courses"). */
  nested?: boolean;
};

export type NavGroup = { heading: string; items: NavItem[] };

const ALL: RoleType[] = ["admin", "content_manager", "instructor", "student"];
const AUTHORS: RoleType[] = ["content_manager", "instructor"];
const BLOG: RoleType[] = ["content_manager"];
const BLOG_READERS: RoleType[] = [
  "admin",
  "content_manager",
  "instructor",
  "student",
];
const ADMIN: RoleType[] = ["admin"];
const STUDENT: RoleType[] = ["student"];

const GROUPS: NavGroup[] = [
  {
    heading: "Learning",
    items: [
      {
        label: "My courses",
        href: "/my-courses",
        icon: "library",
        roles: STUDENT,
        nested: true,
      },
      { label: "My results", href: "/results", icon: "award", roles: STUDENT },
      {
        label: "Course catalogue",
        href: "/courses",
        icon: "compass",
        roles: ALL,
      },
      { label: "Blog", href: "/blog", icon: "pen", roles: BLOG_READERS },
    ],
  },
  {
    heading: "Teaching",
    items: [
      {
        label: "Courses",
        href: "/manage/courses",
        icon: "book",
        roles: AUTHORS,
        nested: true,
      },
      {
        label: "Manage blog",
        href: "/manage/blog",
        icon: "pen",
        roles: BLOG,
        nested: true,
      },
    ],
  },
  {
    heading: "Administration",
    items: [
      { label: "Overview", href: "/admin", icon: "chart", roles: ADMIN },
      {
        label: "Users & roles",
        href: "/admin/users",
        icon: "users",
        roles: ADMIN,
      },
      {
        label: "All courses",
        href: "/admin/courses",
        icon: "layers",
        roles: ADMIN,
      },
      { label: "All Blogs", href: "/admin/blog", icon: "pen", roles: ADMIN },
    ],
  },
];

/** The groups this role can see, with empty groups dropped. */
export function navFor(role: RoleType | null): NavGroup[] {
  if (!role) return [];
  return GROUPS.map((group) => ({
    heading: group.heading,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}

/** Whether a nav item should render as the current page. */
export function isActive(item: NavItem, pathname: string): boolean {
  if (pathname === item.href) return true;
  return Boolean(item.nested) && pathname.startsWith(`${item.href}/`);
}
