import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

import { outputConfig, prompt } from "./config.js";

dotenv.config();

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
  httpOptions: {
    timeout: 30_000,
    retryOptions: {
      attempts: 3,
      initialDelay: 1,
      maxDelay: 8,
    },
  },
});

async function readImageAsBase64(path) {
  const response = await fetch(path);
  const arrayBuffer = await response.arrayBuffer();
  const imageBase64 = Buffer.from(arrayBuffer).toString("base64");

  return imageBase64;
}

function toInlineData(imageBase64) {
  return {
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBase64,
    },
  };
}

async function geminiRequest(contents, attempt = 1) {
  try {
    const response = await genai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: outputConfig,
    });
  
    return response;
  } catch (error) {
    const isRetryable = error.status === 503 ||
      ["UND_ERR_CONNECT_TIMEOUT", "ECONNRESET", "ETIMEDOUT"].includes(error.cause?.code);

    if (isRetryable && attempt < 3) {
      const delay = 1000 * attempt;
      console.log(`Request failed (${error.cause?.code ?? error.status}). Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));

      return geminiRequest(contents, attempt + 1);
    }

    console.log("Error generating content:", error.message);
    throw error;
  }
}

export default async function llmClassifier(path) {
  const imgBase64 = await readImageAsBase64(path);
  const contents = [
    { text: prompt },
    toInlineData(imgBase64),
  ];

  const response = await geminiRequest(contents);

  console.log(response);

  return JSON.parse(response.text)[0].category;
}