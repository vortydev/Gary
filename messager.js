var logger = require('./logger.js');

var delay = 5000; // TODO: make this configurable

exports.reply = function(message, content, deleteAfter) {
    message.reply(content)
        .then(m => {
            if (deleteAfter) {
                m.delete(delay);
            }
        })
        .catch(logger.error);
}

exports.send = function(channel, content, deleteAfter) {
    channel.send(content)
        .then(m => {
            if (deleteAfter) {
                m.delete(delay);
            }
        })
        .catch(logger.error);
}

exports.dm = function(member, content) {
    member.send(content)
        .catch(logger.error);
}
