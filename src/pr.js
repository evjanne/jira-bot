const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");

exports.getPR = async function () {
    const tag = core.getInput("tag") || context.payload.inputs.tag;
    const token = core.getInput("github_token", { required: true });
    const octokit = getOctokit(token);
    const { owner, repo } = context.repo;
    const release = await octokit.repos.getReleaseByTag({ owner, repo, tag });
    const tags = await octokit.paginate(octokit.repos.listTags.endpoint.merge({ owner, repo }));
    const releaseTag = tags.filter((t) => t.name === tag)[0];
    const q = `SHA:${releaseTag.commit.sha}`;
    const searchResults = await octokit.search.issuesAndPullRequests({ q });
    const pr = searchResults.data.items[0];
    return pr;
}

exports.getReviews = async function (pr) {
    const token = core.getInput("github_token", { required: true });
    const octokit = getOctokit(token);
    const { owner, repo } = context.repo;
    const pull_number = pr.number;
    const reviews = await octokit.pulls.listReviews({ owner, repo, pull_number });
    return reviews;
}