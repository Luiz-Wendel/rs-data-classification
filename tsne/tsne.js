import fs from "fs";

import TSNE from "tsne-js";
import { createObjectCsvWriter } from "csv-writer";

let embeddings = JSON.parse(fs.readFileSync("../nearest-neighbors/embeddings/embeddings.json", "utf8"));

const tsneInput = [];

for (let embedding of embeddings) {
  if (embedding.number >= 500 && embedding.number < 1000) {
    tsneInput.push(embedding);
  }
}

const startTime = Date.now();

const tsne = new TSNE({
  dim: 2,
  perplexity: 30.0,
  earlyExaggeration: 4.0,
  learningRate: 100.0,
  nIter: 1000,
  metric: "euclidean"
});

tsne.init({
  data: tsneInput.map(({ embedding }) => embedding),
  type: "dense"
});

tsne.run();

const endTime = Date.now();
console.log(`TSNE took ${Math.floor((endTime - startTime) / 1000 / 60)}:${String(Math.floor((endTime - startTime) / 1000 % 60)).padStart(2, '0')} minutes to run.`);

const output = tsne.getOutput();
const csvOutput = [];

for (let i = 0; i < tsneInput.length; i++) {
  csvOutput.push({
    class: tsneInput[i].class === "dog" ? "blue" : "red",
    x: output[i][0],
    y: output[i][1]
  });
}

const csvWriter = createObjectCsvWriter({
  path: "output/tsne.csv",
  header: [
    { id: "class", title: "color" },
    { id: "x", title: "x" },
    { id: "y", title: "y" }
  ],
  records: csvOutput,
});

await csvWriter.writeRecords(csvOutput);
