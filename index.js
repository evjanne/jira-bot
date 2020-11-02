const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");

async function run() {
    const payload = context.payload;
    console.log(payload);
}

run();