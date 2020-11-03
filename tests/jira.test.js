const setInputs = require("./test-utils");
const { createIssueData } = require("../src/jira");

beforeEach(() => {
  setInputs({
    configuration_file: ".github/jira-config.yml"
  });
});

test("create issue data", () => {
    const issueData = createIssueData("summary", "description");
    console.log(issueData);
});