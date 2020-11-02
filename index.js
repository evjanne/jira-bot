const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");

async function run() {
    const tag = core.getInput("tag") || context.payload.inputs.tag;
    const payload = context.payload;
    const token = core.getInput("github_token", { required: true });
    const octokit = getOctokit(token);
    const { owner, repo } = context.repo;
    const release = await octokit.repos.getReleaseByTag({ owner, repo, tag });
    console.log(release);
    const tags = await octokit.paginate(octokit.repos.listTags.endpoint.defaults({ owner, repo }));
    console.log(tags);
}

run();