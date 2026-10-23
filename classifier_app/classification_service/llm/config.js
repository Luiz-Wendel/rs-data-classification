import { Type } from "@google/genai";

const outputConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          enum: ["cat", "dog"],
          description: "The category of the image, either 'cat' or 'dog'.",
        },
      },
    },
  }
};

const prompt = `
  Identify if the image has one or more cat/dog.
  If it has cat(s), return 'cat'.
  If it has dog(s), return 'dog'.
`;

export {
  outputConfig,
  prompt,
};
