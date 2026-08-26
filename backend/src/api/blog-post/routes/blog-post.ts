/**
 * Blog routes.
 *
 * `find` and `findOne` carry no policy — the brief says anyone can read published
 * posts, including visitors who are not signed in. Draft-hiding is done by the
 * visibility filter in the controller, not by authentication.
 *
 * Everything that writes carries `global::can-manage-blog` (Admin + Content Manager),
 * and the controller then narrows a Content Manager to their own posts.
 */
export default {
  routes: [
    {
      method: "GET",
      path: "/blog-posts",
      handler: "blog-post.find",
    },
    {
      method: "GET",
      path: "/blog-posts/:id",
      handler: "blog-post.findOne",
    },
    {
      method: "POST",
      path: "/blog-posts",
      handler: "blog-post.create",
      config: {
        policies: ["global::can-manage-blog"],
      },
    },
    {
      method: "POST",
      path: "/blog-posts/:id/publish",
      handler: "blog-post.setStatus",
      config: {
        policies: ["global::can-manage-blog"],
      },
    },
    {
      method: "PUT",
      path: "/blog-posts/:id",
      handler: "blog-post.update",
      config: {
        policies: ["global::can-manage-blog"],
      },
    },
    {
      method: "DELETE",
      path: "/blog-posts/:id",
      handler: "blog-post.delete",
      config: {
        policies: ["global::can-manage-blog"],
      },
    },
  ],
};
