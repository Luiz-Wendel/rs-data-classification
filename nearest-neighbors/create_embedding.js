import fs from "fs";

import { pipeline } from "@huggingface/transformers";

const imgEmbedder = await pipeline(
  "image-feature-extraction",
  "Xenova/clip-vit-base-patch32",
  { dtype: "fp32" },
);

async function embedImg(imgs) {
  return await imgEmbedder(imgs, { pooling: "cls", normalize: true }).then((res) => res.tolist());
}

const images = fs.readdirSync("./train").map((file) => `./train/${file}`);

let startIndex = 0;
const batchSize = 500;

const startTime = Date.now();

while (startIndex < images.length) {
  const endIndex = Math.min(startIndex + batchSize, images.length);
  const batchImages = images.slice(startIndex, endIndex);

  console.log(`Embedding images from ${startIndex} to ${endIndex}`);

  const embeddings = await embedImg(batchImages);

  const output = [];

  for (let i = 0; i < embeddings.length; i++) {
    output.push({
      path: images[startIndex + i],
      embedding: embeddings[i],
    });
  }

  fs.writeFileSync(
    `embeddings/embedding_${startIndex}-${endIndex}.json`,
    JSON.stringify(output, null, 2),
  );

  startIndex = endIndex;
}

const endTime = Date.now();
console.log(`Embedding completed in ${(endTime - startTime) / 1000} seconds`);
