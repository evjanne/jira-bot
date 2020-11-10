const setInputs = require("./test-utils");
const { parseConfig } = require("../src/config");

beforeEach(() => {
  setInputs({
    configuration_file: ".github/jira-config.yml",
  });
});

test("read configuration", () => {
  const config = parseConfig();
  expect(config).toEqual({
    project: "11212",
    issue_link_type: "Cause",
    issue_type: "50",
    fields: {
      components: [{ id: "17501" }],
      customfield_10913: { id: "15862" },
      customfield_10898: { type: "current_time" },
      customfield_10899: { type: "current_time_plus_hour" },
      customfield_11581: { id: "16820" },
    },
    resolve: {
      fields: {
        customfield_10914: {
          from: "customfield_10898",
        },
        customfield_10915: {
          type: "current_time",
        },
        customfield_10916: {
          id: "15868",
        },
        resolution: {
          id: "1",
        },
      },
      transition: {
        id: "21",
      },
    },
  });
});
