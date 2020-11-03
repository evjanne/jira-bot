const core = require("@actions/core");

exports.parseTicketNumber = function (title) {
    const ticketPrefix = core.getInput("ticket_prefix", { required: true });
    const re = new RegExp(`${ticketPrefix}\\-\\d+`);
    const result = re.exec(title);
    return result ? result[0] : null;
 }
