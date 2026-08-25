import type { Schema, Struct } from '@strapi/strapi';

export interface QuizOption extends Struct.ComponentSchema {
  collectionName: 'components_quiz_options';
  info: {
    displayName: 'Option';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface QuizQuestion extends Struct.ComponentSchema {
  collectionName: 'components_quiz_questions';
  info: {
    displayName: 'Question';
  };
  attributes: {
    correctOptionIndex: Schema.Attribute.Integer;
    options: Schema.Attribute.Component<'quiz.option', true>;
    text: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'quiz.option': QuizOption;
      'quiz.question': QuizQuestion;
    }
  }
}
