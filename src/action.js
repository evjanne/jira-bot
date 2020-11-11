const core = require("@actions/core");
const { context } = require("@actions/github");
const J2M = require("j2m");
const {
  getPR,
  getReviews,
  getRelease,
  getUser,
  appendReleaseBody,
} = require("./gh");
const { parseConfig } = require("./config");
const {
  assignTicket,
  createTicket,
  getIssue,
  resolveIssue,
} = require("./jira");

exports.run = async function () {
  let type = core.getInput("type");
  if (!type) {
    type = context.payload.inputs.type;
  }
  if (type === "create") {
    console.log("Create ticket");
    await newTicket();
  } else if (type === "resolve") {
    console.log("Resolve ticket");
    await resolveTicket();
  } else {
    core.setFailed(`Invalid action type: ${type}`);
  }
};

async function newTicket() {
  const jira_host = core.getInput("jira_host", { required: true });
  const ticket_descriptor = core.getInput("ticket_descriptor");
  const config = parseConfig();

  const pr = await getPR();
  const reviews = await getReviews(pr);
  console.log(reviews);
  const release = await getRelease();
  const body = await buildTicketBody(pr, release, reviews);
  console.log(body);
  const ticket = await createTicket(release.data.name, body, pr.user.login);
  if (config.users && config.users[pr.user.login]) {
    await assignTicket(ticket.id, config.users[pr.user.login]);
  }
  console.log(ticket);
  await appendReleaseBody(
    `${ticket_descriptor}: [${ticket.key}](https://${jira_host}/browse/${ticket.key})`
  );
}

async function buildTicketBody(pr, release, reviews) {
  let body = J2M.toJ(release.data.body);
  body += "\n\n*Author*\n";
  body += await getUserLink(pr.user);

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
    body += (await getUserLink(uniqueReviews[i].user)) + "\n";
  }
  return body;
}

async function getUserLink(user) {
  const userData = await getUser(user.login);
  if (userData.email) {
    return `[~${userData.email}]`;
  }
  return `[${userData.name || userData.login}|${userData.html_url}]`;
}

async function resolveTicket() {
  const release = await getRelease();
  const ticketNumber = parseTicketNumber(release.data.body);
  const issue = await getIssue(ticketNumber);
  await resolveIssue(issue);
}

function parseTicketNumber(releaseBody) {
  const re = /(\[\w+\-\d+\])/;
  const result = re.exec(releaseBody);
  const ticket = result ? result[1].slice(1, -1) : null;
  return ticket;
}
