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
    apiVersion: "3",
  });
}

exports.createIssueData = function (summary, description) {
  start_time = moment().format();
  const config = parseConfig();
  const issueFields = {
    project: { id: config.project },
    issuetype: { id: config.issue_type },
    summary: summary,
    description: description,
  };
  if (config.custom_fields) {
    for (const [key, value] of Object.entries(config.custom_fields)) {
      if (value.type === "start_time") {
        issueFields[key] = moment().format();
      } else if (value.type === "end_time") {
        issueFields[key] = moment().add({ hour: 1 }).format();
      } else {
        issueFields[key] = value;
      }
    }
  }
  const issueData = {
      update: {},
      fields: issueFields
  }
  return issueData;
};

exports.createTicket = async function (summary, description) {
  const jira = getJiraClient();
  const issueData = exports.createIssueData(summary, description);
  const issue = await jira.addNewIssue(issueData);
  return issue;
};
