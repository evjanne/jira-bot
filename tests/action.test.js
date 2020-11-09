const rewire = require("rewire");
const index = rewire("../src/action.js");
const parseTicketNumber = index.__get__("parseTicketNumber");

test("parse ticket number from body", () => {
  const ticketNumber = parseTicketNumber("Release info\n\nMuha: [DEMO-12345](https://demo.jira.com)\nMuha: [DEMO-12342](https://demo.jira.com)");
  expect(ticketNumber).toEqual("DEMO-12345");
})

test("no ticket number found", () => {
  const ticketNumber = parseTicketNumber("Release info");
  expect(ticketNumber).toEqual(null);
})