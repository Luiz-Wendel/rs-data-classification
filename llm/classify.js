import fs from "fs";

import dotenv from "dotenv";
import { createPartFromUri, createUserContent, GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const embeddings = JSON
  .parse(fs.readFileSync("../nearest-neighbors/embeddings/embeddings.json", "utf-8"));

const testEmbeddings = embeddings.reduce((acc, curr) => {
  if (curr.split === "test") {
    acc.push("../nearest-neighbors" + curr.path.slice(1));
  }
  return acc;
}, []);

const image = await genai.files.upload({
  file: testEmbeddings[0],
  config: {
    mimeType: "image/jpeg",
  },
});

async function generateContentFromImage(image) {
  try {
    const response = await genai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: createUserContent([
        createPartFromUri(image.uri, image.mimeType),
        `
          Identify if the image has one or more cat/dog.
          If it has cat(s), return 'cat'.
          If it has dog(s), return 'dog'.
        `,
      ]),
      config: {
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
      }
    });
  
    console.log(response.text);
  } catch (error) {
    if (error.status === 503) {
      console.log("Service unavailable. Retrying in 1s...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      await generateContentFromImage(image);
    }
  }
}

await generateContentFromImage(image);
