import fs from "fs";

const files = fs.readdirSync("./embeddings").map((file) => `./embeddings/${file}`);

let embeddings = [];

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, "utf-8"));

  embeddings = embeddings.concat(data);
}

for (const embedding of embeddings) {
  embedding.number = parseInt(/\d+/.exec(embedding.path));
  embedding.split = embedding.number < 500 ? "test" : "train";
  embedding.class = embedding.path.includes("cat") ? "cat" : "dog";
}

fs.writeFileSync("embeddings/embeddings.json", JSON.stringify(embeddings, null, 2));
