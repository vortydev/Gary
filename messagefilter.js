var config = require('./messagefilter.json');

exports.filter = function (message) {
    var channelinfo = null;

    for (var i = 0; i < config.length; i++) {
        if (config[i].channel == message.channel.name) {
            channelinfo = config[i];
        }
    }

    if (channelinfo == null)
        channelinfo = config[0];

    var blacklist = channelinfo.blacklist;
    if (blacklist == null)
        blacklist = config[0].blacklist;
    for (var i = 0; i < blacklist.length; i++) {
        if (message.content.includes(blacklist[i])) {
             message.delete();
            return;
        }
    }

    var whitelist = channelinfo.whitelist;
    if (whitelist == null)
        whitelist = config[0].whitelist;
    for (var i = 0; i < whitelist.length; i++) {
        if (!message.content.includes(whitelist[i])) {
            message.delete();
            return;
        }
    }
}
