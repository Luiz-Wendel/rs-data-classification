import fs from "fs";

import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

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

const embeddings = JSON
  .parse(fs.readFileSync("../nearest-neighbors/embeddings/embeddings.json", "utf-8"));

const testInstances = embeddings.reduce((acc, curr) => {
  if (curr.split === "test") {
    acc.push({
      trueClass: curr.class,
      path: "../nearest-neighbors" + curr.path.slice(1),
    });
  }

  return acc;
}, []);

function readImageAsBase64(path) {
  return fs.readFileSync(path, { encoding: "base64" });
}

function toInlineData(imageBase64) {
  return {
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBase64,
    },
  };
}

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

async function llmClassifier(path) {
  const imgBase64 = readImageAsBase64(path);
  const contents = [
    { text: prompt },
    toInlineData(imgBase64),
  ];

  const response = await geminiRequest(contents);

  console.log(response);

  return JSON.parse(response.text)[0].category;
}

function getAccuracy(results) {
  const correctPredictions = results.filter(result => result.trueClass === result.predictedClass);

  return (correctPredictions.length / results.length) * 100;
}

const predictions = [];
const concurrency = 5;

for (let i = 0; i < testInstances.length; i += concurrency) {
  const batch = testInstances.slice(i, i + concurrency);
  const batchPredictions = await Promise.all(batch.map(instance => llmClassifier(instance.path)));
  predictions.push(...batchPredictions);
}

for (let i = 0; i < testInstances.length; i++) {
  testInstances[i].predictedClass = predictions[i];
}

console.log(getAccuracy(testInstances));
