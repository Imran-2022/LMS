import { requireBlogManager } from "@/lib/session";

export default async function BlogManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireBlogManager("/manage/blog");
  return children;
}