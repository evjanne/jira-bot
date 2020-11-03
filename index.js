const core = require("@actions/core");
const { getPR, getReviews} = require("./src/pr");

async function run() {
    const pr = await getPR();
    const reviews = await getReviews(pr);
    console.log(reviews);
}

run();