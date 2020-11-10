const core = require("@actions/core");
const { context } = require("@actions/github");
const J2M = require('j2m');
const {
  getPR,
  getReviews,
  getRelease,
  appendReleaseBody,
} = require("./gh");
const { parseConfig } = require("./config");
const { createTicket, getTicket } = require("./jira");

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
  const ticket = await createTicket(release.data.name, body, pr.user.login);
  console.log(ticket);
  await appendReleaseBody(
    `${ticket_descriptor}: [${ticket.key}](https://${jira_host}/browse/${ticket.key})`
  );
}

function buildTicketBody(pr, release, reviews) {
  const config = parseConfig();
  let body = J2M.toJ(release.data.body);
  body += "\n\n*Author*\n";
  body += getUserLink(config, pr.user);

  body += "\n\n*Reviewers*\n";
  const approvedReviews = reviews.data.filter(
    (review) => review.state === "APPROVED"
  );
  const uniqueReviews = [
    ...new Map(
      approvedReviews.map((review) => [review.user.id, review])
    ).values(),
  ];
  for (let i = 0; i < uniqueReviews.length; i++) {
    body += getUserLink(config, uniqueReviews[i].user) + "\n";
  }
  return body;
}

function getUserLink(config, user) {
  if (config.users && config.users[user.login]) {
      return `[~${config.users[user.login]}]`;
  }
  return `[${user.name || user.login}|${user.html_url}]`
}

async function updateTicket() {    
  const release = await getRelease();
  const ticketNumber = parseTicketNumber(release.data.body);
  const ticket = await getTicket(ticketNumber);
}

function parseTicketNumber(releaseBody) {
  const re = /(\[\w+\-\d+\])/;
  const result = re.exec(releaseBody);
  const ticket = result ? result[1].slice(1, -1) : null;
  return ticket;
}