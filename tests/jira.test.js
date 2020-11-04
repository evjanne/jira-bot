const setInputs = require("./test-utils");
const { createIssueData } = require("../src/jira");
var moment = require("moment-timezone");

beforeEach(() => {
  setInputs({
    configuration_file: ".github/jira-config.yml"
  });
});

test("create issue data", () => {
    const issueData = createIssueData("summary", "description");
    const start_time = issueData.fields.customfield_10898;
    const end_time = issueData.fields.customfield_10899;
    expect(moment(start_time).isValid()).toEqual(true);
    expect(moment(end_time).isValid()).toEqual(true);
    expect(issueData).toEqual({
        update: {},
        fields: {
          project: { id: '11212' },
          issuetype: { id: '50' },
          summary: 'summary',
          description: 'description',
          components: [ 'Netpvr:Viscurator' ],
          customfield_10913: { id: '15862' },
          customfield_10898: start_time,
          customfield_10899: end_time,
          customfield_11581: { id: '16820' }
        }
      });
});