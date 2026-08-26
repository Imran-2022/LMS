import { BlogForm } from "@/components/blog/BlogForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewBlogPage() {
  return <><PageHeader eyebrow="Content workspace" title="Write a post" description="Create a new article for the CPS Academy blog." /><div className="mt-8 max-w-3xl rounded border border-ink-200 bg-white p-6 sm:p-8"><BlogForm /></div></>;
}