export default {
  collectionName: "components_quiz_questions",
  info: { displayName: "Question" },
  attributes: {
    text: { type: "string" },
    options: {
      type: "component",
      repeatable: true,
      component: "quiz.option",
    },
    correctOptionIndex: { type: "integer" },
  },
};