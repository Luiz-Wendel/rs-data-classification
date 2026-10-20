import { cos_sim } from "@huggingface/transformers";
import fs from "fs";

const embeddings = JSON.parse(
  fs.readFileSync("../nearest-neighbors/embeddings/embeddings.json", "utf8"),
);

const trainingEmbeddings = embeddings.filter(({ split }) => split === "train");
const testEmbeddings = embeddings.filter(({ split }) => split === "test");

function compare(testEmbedding) {
  const distances = [];

  for (let trainingEmbedding of trainingEmbeddings) {
    const distance = cos_sim(
      testEmbedding.embedding,
      trainingEmbedding.embedding,
    );

    distances.push({
      distance,
      class: trainingEmbedding.class,
    });
  }

  return distances;
}

function getKNearestNeighbors(distances, k) {
  distances.sort((a, b) => a.distance - b.distance);

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

function knnClassifier(testEmbedding, k) {
  const distances = compare(testEmbedding);
  const knn = getKNearestNeighbors(distances, k);
  const classCount = countClasses(knn);
  const predictedClass = getMaxClass(classCount);

  return predictedClass;
}
