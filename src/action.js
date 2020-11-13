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
const { createTicket, getIssue, resolveIssue } = require("./jira");

exports.run = async function () {
  let action = core.getInput("action");
  if (!action) {
    type = context.payload.inputs.type;
  }
  if (action === "create") {
    console.log("Create ticket");
    await newTicket();
  } else if (action === "resolve") {
    console.log("Resolve ticket");
    await resolveTicket();
  } else {
    core.setFailed(`Invalid action type: ${type}`);
  }
};

async function newTicket() {
  const jira_host = core.getInput("jira_host", { required: true });
  const ticket_descriptor = core.getInput("ticket_descriptor");
  const title = core.getInput("title");
  const description = core.getInput("description");

  const pr = await getPR();
  console.log(pr);
  const reviews = await getReviews(pr);
  console.log(reviews);
  const ticketDescription = await buildTicketDescription(
    pr.user,
    description,
    reviews
  );
  console.log(ticketDescription);
  const ticket = await createTicket(title, ticketDescription);
  console.log(ticket);
  await appendReleaseBody(
    `${ticket_descriptor}: [${ticket.key}](https://${jira_host}/browse/${ticket.key})`
  );
}

async function buildTicketDescription(author, description, reviews) {
  let body = J2M.toJ(description);
  body += "\n\n*Author*\n";
  body += await getUserLink(author);

  if (reviews) {
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
  console.log(release.data.body);
  console.log(ticketNumber);
  const issue = await getIssue(ticketNumber);
  await resolveIssue(issue);
}

function parseTicketNumber(releaseBody) {
  const re = /(\[\w+\-\d+\])/;
  const result = re.exec(releaseBody);
  const ticket = result ? result[1].slice(1, -1) : null;
  return ticket;
}
