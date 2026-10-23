import express from "express";
import cors from "cors";

import { init as knnInit, knnClassify } from './knn/api.js'
import { llmClassify } from './llm/api.js'

// const catExample = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHixzeHkYmjfqDaUWSM5_GcbWspfBsVlpc8ekD7r0Lpg&s=10"
// const dogExample = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-rTdT2WX-YerT0ldO_FyTb_NKUhhniDuZrrD5FNJlHA&s=10"

const app = express();
const port = 3000;

await knnInit();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
}));

app.get("/ping", (_req, res) => {
  res.send("pong!");
});

app.post("/classify", async (req, res) => {
  const method = req.body.method;
  const imagePath = req.body.imagePath;

  console.log(`Received request to classify using method: ${method}`);

  let result = null;

  if (method === "llm") {
    result = await llmClassify(imagePath);
  } else if (method === "knn") {
    const k = req.body.k || 5;

    result = await knnClassify(imagePath, k);
  } else {
    return res.status(400).send({ error: "Invalid method" });
  }

  res.send({ category: result });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
