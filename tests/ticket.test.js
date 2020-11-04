jest.mock("@actions/github");

const setInputs = require("./test-utils");
const { parseTitle } = require("../src/ticket");

beforeEach(() => {
  setInputs({
    ticket_prefix: "EVI"
  });
});

test("parse ticket number", () => {
  const result = parseTitle("EVI-12345 Test PR");
  expect(result).toEqual({ticket: "EVI-12345", title: "Test PR"});
});

test("no ticket number", () => {
  const result = parseTitle("This is just test PR");
  expect(result).toEqual({title: "This is just test PR"});
});
