const core = require("@actions/core");
const { getOctokit, context } = require("@actions/github");

async function run() {
    const tag = core.getInput("tag") || context.payload.inputs.tag;
    const token = core.getInput("github_token", { required: true });
    const octokit = getOctokit(token);
    const { owner, repo } = context.repo;
    const release = await octokit.repos.getReleaseByTag({ owner, repo, tag });
    console.log(release);
    const tags = await octokit.paginate(octokit.repos.listTags.endpoint.merge({ owner, repo }));
    const releaseTag = tags.filter((t) => t.name === tag)[0];
    console.log(releaseTag);
    const q = `SHA:${releaseTag.commit.sha}`;
    const searchResults = await octokit.search.issuesAndPullRequests({ q });
    const pr = searchResults.data.items[0];
    console.log(pr);
    const pull_number = pr.number;
    const reviews = await octokit.pulls.listReviews({ owner, repo, pull_number });
    console.log(reviews);
    parseTicketNumber(pr.title);
}

function parseTicketNumber(title) {
    const ticketPrefix = core.getInput("ticket_prefix", { required: true });
    const re = new RegExp(`\\\$${ticketPrefix}\\-\\d+`);
    const result = title.match(re);
    console.log(result);
}

run();