import { pipeline } from "@huggingface/transformers";

export default class ImageEmbedder {
  static task = "image-feature-extraction";
  static model = "Xenova/clip-vit-base-patch32";
  static dtype = "fp32";
  static pooling = "cls";
  static normalize = true;

  static pipeline = null;

  static async loadInstance() {
    if (!this.pipeline) {
      this.pipeline = await pipeline(this.task, this.model, { dtype: this.dtype });
    }

    return this.pipeline;
  }

  static async embedImage(imgPath) {
    const config = { pooling: this.pooling, normalize: this.normalize };

    return this.pipeline(imgPath, config).then((res) => res.tolist());
  }
}
