const core = require("@actions/core");

exports.parseTitle = function (title) {
    const ticketPrefix = core.getInput("ticket_prefix", { required: true });
    const re = new RegExp(`^(${ticketPrefix}\\-\\d+)(.*)$`);
    const result = re.exec(title);
    if (result) {
        return {ticket: result[1], title: result[2].trim()};
    }
    return {title};
 }
