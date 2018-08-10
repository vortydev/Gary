var logger = require('./logger.js');

var delay = 5000; // TODO: make this configurable


exports.reply = function(message, content, deleteAfter) {
    message.reply(content)
        .then(m => {
            if (deleteAfter) {
                m.delete(delay)
                    .catch(logger.error);
            }
        })
        .catch(logger.error);
}

exports.send = function(channel, content, deleteAfter, callback) {
    channel.send(content)
        .then(m => {
            if (deleteAfter) {
                m.delete(delay)
                    .catch(logger.error);
            }

            if (callback) {
                // janky little timer I found on SO... seems to work?
                ((t) => {
                    var start = new Date()
                        .getTime();

                    for (var i = 0; i < 1e7; i++) {
                        if ((new Date().getTime() - start) > t)
                            break;
                    }
                })(delay);

                callback(m);
            }
        })
        .catch(logger.error);
}

exports.dm = function(member, content) {
    member.send(content)
        .catch(logger.error);
}
