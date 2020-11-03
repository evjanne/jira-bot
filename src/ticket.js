const core = require("@actions/core");

function parseTicketNumber(title) {
    const ticketPrefix = core.getInput("ticket_prefix", { required: true });
    const re = new RegExp(`${ticketPrefix}\\-\\d+`);
    console.log(title);
    const result = re.exec(title);
    return result ? result[0] : null;
 }

module.exports = parseTicketNumber;
