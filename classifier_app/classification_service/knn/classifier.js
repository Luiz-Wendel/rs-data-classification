import { cos_sim } from "@huggingface/transformers";

import embedImg from "./embedder.js";

function compare(testEmbedding, knowledgeBase) {
  const distances = [];

  for (let embedding of knowledgeBase) {
    const distance = cos_sim(
      testEmbedding,
      embedding.embedding,
    );

    distances.push({
      distance,
      class: embedding.class,
    });
  }

  return distances;
}

function getKNearestNeighbors(distances, k) {
  distances.sort((a,b) => {
      if (a.distance > b.distance) {
        return -1;
      }  else {
        return 1;
      }
    });

  return distances.slice(0, k);
}

function countClasses(knn) {
  const classCount = {};

  for (let n of knn) {
    if (classCount[n.class]) {
      classCount[n.class]++;
    } else {
      classCount[n.class] = 1;
    }
  }

  return classCount;
}

const getMaxClass = (classCount) => {
  let maxClass = null;
  let maxCount = 0;

  for (let className in classCount) {
    if (classCount[className] > maxCount) {
      maxCount = classCount[className];
      maxClass = className;
    }
  }

  return maxClass;
};

export default async function knnClassifier(path, k, knowledgeBase) {
  const embedding = await embedImg(path);
  const distances = compare(embedding, knowledgeBase);
  const knn = getKNearestNeighbors(distances, k);
  const classCount = countClasses(knn);
  const predictedClass = getMaxClass(classCount);

  return predictedClass;
}
