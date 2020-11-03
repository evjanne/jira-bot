const core = require("@actions/core");
const { context } = require("@actions/github");
const {
  getPR,
  getReviews,
  getRelease,
  appendReleaseBody,
} = require("./src/gh");
const { createTicket } = require("./src/jira");

async function run() {
  const jira_host = core.getInput("jira_host", { required: true });
  const ticket_descriptor = core.getInput("ticket_descriptor");
  const pr = await getPR();
  const reviews = await getReviews(pr);
  reviews.data[0].user.id;
  const release = await getRelease();
  const body = buildTicketBody(pr, release, reviews);
  console.login(body);
  //const ticket = await createTicket(summary, body);
  const ticket = { key: "EVI-12345" };
  await appendReleaseBody(
    `${ticket_descriptor}: [${ticket.key}](https://${jira_host}/browse/${ticket.key})`
  );
}

function buildTicketBody(pr, release, reviews) {
  let body = release.data.body;
  body += `\n*Author*\n[${pr.user.login}|${pr.user.url}]`;
  const approvedReviews = reviews.data.filter(
    (review) => review.data === "APPROVED"
  );
  const uniqueReviews = [
    ...new Map(
      approvedReviews.map((review) => [review.user.id, review])
    ).values(),
  ];
  body += "\n*Reviewers*\n";
  for (let i = 0; i < uniqueReviews.length; i++) {
    body += `[${uniqueReviews[i].user.login}|${uniqueReviews[i].user.url}]\n`
  }
  return body;
}

//TODO: Parse ticket number away from the title for Muha body

run();
