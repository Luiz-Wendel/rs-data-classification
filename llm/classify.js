import fs from "fs";

import dotenv from "dotenv";
import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";

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
        "Faça uma descrição da imagem acima",
      ]),
    });
  
    console.log(response.text);
  } catch (error) {
    if (error.status === 503) {
      console.log("Service unavailable. Retrying in 3 seconds...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      await generateContentFromImage(image);
    }
  }
}

await generateContentFromImage(image);
