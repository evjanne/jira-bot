const setInputs = require("./test-utils");
const { parseConfig } = require("../src/config");

beforeEach(() => {
  setInputs({
    configuration_file: ".github/jira-config.yml"
  });
});

test("read configuration", () => {
    const config = parseConfig();
    expect(config).toEqual({
        project: '11212',
        issue_link_type: 'Cause',
        issue_type: '50',
        fields: {
          components: ['Netpvr:Viscurator'],
          customfield_10913: { id: '15862' },
          customfield_10898: { type: 'start_time' },
          customfield_10899: { type: 'end_time' },
          customfield_11581: { id: '16820' }
        }
      })
})