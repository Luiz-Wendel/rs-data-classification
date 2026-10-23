import { pipeline } from "@huggingface/transformers";

const imgEmbedder = await pipeline(
  "image-feature-extraction",
  "Xenova/clip-vit-base-patch32",
  { dtype: "fp32" },
);

export default async function embedImg(imgPath) {
  return await imgEmbedder(imgPath, { pooling: "cls", normalize: true }).then((res) => res.tolist());
}
