"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { BlogForm } from "./BlogForm";
import { Button } from "@/components/ui/Button";
import { FormDialog } from "@/components/ui/FormDialog";
import { IconButton } from "@/components/ui/IconButton";
import { loadPost } from "@/lib/actions/blog";
import type { BlogPost } from "@/lib/types";

export function BlogAuthoringDialog({
  post,
  iconOnly = false,
}: {
  post?: BlogPost;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const editing = Boolean(post);

  return (
    <>
      {iconOnly && editing ? (
        <IconButton label="Edit post" onClick={() => setOpen(true)}>
          <Pencil size={17} strokeWidth={2.25} aria-hidden="true" />
        </IconButton>
      ) : (
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          {editing ? "Edit post" : "Write blog"}
        </Button>
      )}
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit post" : "Write blog"}
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
