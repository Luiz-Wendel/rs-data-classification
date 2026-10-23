import fs from "fs";

import knnClassifier from "./classifier.js";

let knowledgeBase = null;

function init() {
  const embeddings = JSON.parse(fs.readFileSync('./knn/embeddings.json', 'utf-8'));
  knowledgeBase = embeddings.filter(embedding => embedding.split === 'train');
}

async function knnClassify(path, k) {
  return knnClassifier(path, k, knowledgeBase);
}

export { init, knnClassify };
