import llmClassifier from './classifier.js';

async function llmClassify(path) {
  return llmClassifier(path);
}

export { llmClassify };
