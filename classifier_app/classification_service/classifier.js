import { init, knnClassify } from './knn/api.js'

const dogExample = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-rTdT2WX-YerT0ldO_FyTb_NKUhhniDuZrrD5FNJlHA&s=10"
const catExample = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHixzeHkYmjfqDaUWSM5_GcbWspfBsVlpc8ekD7r0Lpg&s=10"

await init();
console.log(await knnClassify(catExample, 5));
