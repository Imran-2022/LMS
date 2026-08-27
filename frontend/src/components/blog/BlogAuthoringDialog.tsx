"use client";

import { useState } from "react";

import { BlogForm } from "./BlogForm";
import { Button } from "@/components/ui/Button";
import { FormDialog } from "@/components/ui/FormDialog";
import { loadPost } from "@/lib/actions/blog";
import type { BlogPost } from "@/lib/types";

export function BlogAuthoringDialog({ post }: { post?: BlogPost }) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(post);

  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        {editing ? "Edit post" : "Write post"}
      </Button>
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit post" : "Write post"}
        recordId={post?.id ?? null}
        load={editing ? loadPost : undefined}
        render={(record) => {
          if (editing && !record) return null;
          return <BlogForm post={(record as BlogPost | undefined) ?? undefined} onDone={() => setOpen(false)} />;
        }}
      />
    </>
  );
}
