jest.mock("@actions/github");

const setInputs = require("./test-utils");
const parseTicketNumber = require("../src/ticket");

beforeEach(() => {
  setInputs({
    ticket_prefix: "EVI"
  });
});

test("parse ticket number", () => {
  const result = parseTicketNumber("EVI-12345 Test PR");
  expect(result).toEqual("EVI-12345");
});

test("no ticket number", () => {
  const result = parseTicketNumber("This is just test PR");
  expect(result).toEqual(null);
});
