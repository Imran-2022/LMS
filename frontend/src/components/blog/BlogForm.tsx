"use client";

import { useActionState } from "react";
import { errorOf } from "@/lib/form";
import { useActionResult } from "@/components/ui/useActionResult";
import { createPost, updatePost } from "@/lib/actions/blog";
import { Input, Textarea, FormError, Checkbox } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { BlogPost } from "@/lib/types";

export function BlogForm({ post, onDone }: { post?: BlogPost; onDone?: () => void }) {
  const [state, action] = useActionState(
    post ? updatePost : createPost,
    undefined,
  );
  useActionResult(state, onDone ? () => onDone() : undefined);
  return (
    <form action={action} className="space-y-5">
      <FormError>{errorOf(state)}</FormError>
      {post ? (
        <>
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="originalSlug" value={post.slug} />
        </>
      ) : null}
      <Input
        label="Title"
        name="title"
        required
        defaultValue={post?.title ?? ""}
      />
      <Textarea
        label="Excerpt"
        name="excerpt"
        rows={2}
        defaultValue={post?.excerpt ?? ""}
      />
      <Textarea
        label="Body"
        name="body"
        rows={14}
        required
        defaultValue={post?.body ?? ""}
      />
      <Input
        label="Cover image URL"
        name="coverImageUrl"
        type="url"
        defaultValue={post?.coverImageUrl ?? ""}
      />
      <Input
        label="Tags"
        name="tags"
        defaultValue={post?.tags.join(", ") ?? ""}
        hint="Separate tags with commas."
      />
      <Input
        label="Reading time"
        name="readingMinutes"
        type="number"
        min={0}
        defaultValue={post?.readingMinutes ?? 5}
      />
      <Checkbox
        name="publishNow"
        label="Publish immediately"
        defaultChecked={post?.status === "published"}
      />
      <SubmitButton pendingLabel="Saving...">
        {post ? "Save post" : "Create post"}
      </SubmitButton>
    </form>
  );
}
