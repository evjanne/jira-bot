const core = require("@actions/core");
const JiraApi = require("jira-client");
const { parseConfig } = require("./config");

var moment = require("moment-timezone");
moment.locale("fi");
moment.defaultFormat = "YYYY-MM-DDTHH:mm:ss.SSSZZ";
moment.tz.setDefault("Europe/Helsinki");

function getJiraClient() {
  return new JiraApi({
    protocol: "https",
    host: core.getInput("jira_host", { required: true }),
    username: core.getInput("jira_username", { required: true }),
    password: core.getInput("jira_password", { required: true }),
    apiVersion: "2",
  });
}

exports.createIssueData = function (summary, description, linkedIssueKey) {
  start_time = moment().format();
  const config = parseConfig();
  const fields = {
    project: { id: config.project },
    issuetype: { id: config.issue_type },
    summary: summary,
    description: description,
  };
  if (config.fields) {
    for (const [key, value] of Object.entries(config.fields)) {
      if (value.type === "start_time") {
        fields[key] = moment().format();
      } else if (value.type === "end_time") {
        fields[key] = moment().add({ hour: 1 }).format();
      } else {
        fields[key] = value;
      }
    }
  }
  const update = {};
  if (linkedIssueKey && config.issue_link_type) {
    update["issuelinks"] = [
      {
        add: {
          type: {
            name: config.issue_link_type,
          },
          inwardIssue: {
            key: linkedIssueKey,
          },
        },
      },
    ];
  }
  const issueData = {
    update,
    fields,
  };
  return issueData;
};

exports.createTicket = async function (title, description) {
  const jira = getJiraClient();
  const parsedTitle = exports.parseTitle(title);
  const issueData = exports.createIssueData(parsedTitle.title, description, parsedTitle.ticketNumber);
  try {
    return await jira.addNewIssue(issueData);
  } catch (error) {
    core.setFailed(error.message);
    process.exit(1);
  }
};

exports.parseTitle = function (title) {
    const re = /^(\w+\-\d+)(.*)$/
    const result = re.exec(title);
    if (result) {
        return {ticketNumber: result[1], title: result[2].trim()};
    }
    return {title};
 }
