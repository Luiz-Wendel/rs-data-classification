import fs from "fs";

import { pipeline } from "@huggingface/transformers";

const imgEmbedder = pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32", { dtype: "fp32" });

async function embedImg(imgs) {
  return imgEmbedder(imgs, { pooling: "cls", normalize: true }).then((res) => res.tolist());
}

const images = fs.readdirSync("./train").map((file) => `./train/${file}`);

console.log(images);
