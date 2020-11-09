const core = require("@actions/core");
const { context } = require("@actions/github");
const {
  getPR,
  getReviews,
  getRelease,
  appendReleaseBody,
} = require("./gh");
const { createTicket } = require("./jira");

exports.run = async function() {
  let type = core.getInput("type");
  if (!type) {
    tyre = context.payload.inputs.type;
  }
  if (type === "create") {
    console.log("Create ticket");
    await newTicket();
  } else if (type === "update") {
    console.log("Update ticket");
    await updateTicket();
  } else {
    core.setFailed(`Invalid action type: ${type}`)
  }
}

async function newTicket() {
  const jira_host = core.getInput("jira_host", { required: true });
  const ticket_descriptor = core.getInput("ticket_descriptor");

  const pr = await getPR();
  const reviews = await getReviews(pr);
  console.log(reviews);
  const release = await getRelease();
  const body = buildTicketBody(pr, release, reviews);
  console.log(body);
  const ticket = await createTicket(release.data.name, body);
  console.log(ticket);
  await appendReleaseBody(
    `${ticket_descriptor}: [${ticket.key}](https://${jira_host}/browse/${ticket.key})`
  );
}

function buildTicketBody(pr, release, reviews) {
  let body = release.data.body;
  body += `\n*Author*\n[${pr.user.login}|${pr.user.url}]`;
  const approvedReviews = reviews.data.filter(
    (review) => review.state === "APPROVED"
  );
  const uniqueReviews = [
    ...new Map(
      approvedReviews.map((review) => [review.user.id, review])
    ).values(),
  ];
  body += "\n*Reviewers*\n";
  for (let i = 0; i < uniqueReviews.length; i++) {
    body += `[${uniqueReviews[i].user.login}|${uniqueReviews[i].user.url}]\n`;
  }
  return body;
}

async function updateTicket() {    
  const release = await getRelease();
  const ticket = parseTicketNumber(release.data.body);
}

function parseTicketNumber(releaseBody) {
  const re = /(\[\w+\-\d+\])/;
  const result = re.exec(releaseBody);
  const ticket = result ? result[1].slice(1, -1) : null;
  return ticket;
}