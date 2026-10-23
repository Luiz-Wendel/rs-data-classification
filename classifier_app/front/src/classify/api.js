export default async function classificationRequest(source, method) {
const response = await fetch('http://localhost:3000/classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method: method || 'knn',
      imagePath: source,
    })
  });

  const data = await response.json();

  return data.category;
}