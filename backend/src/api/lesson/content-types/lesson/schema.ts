export default {
  kind: "collectionType",
  collectionName: "lessons",
  info: { singularName: "lesson", pluralName: "lessons", displayName: "Lesson" },
  attributes: {
    title: { type: "string", required: true },
    content: { type: "richtext" },
    order: { type: "integer" },
    course: { type: "relation", relation: "manyToOne", target: "api::course.course", inversedBy: "lessons" },
  },
};