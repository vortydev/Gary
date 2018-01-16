var config = require('./messagefilter.json');

exports.init = function (client, config, package, logger) {
    client.on('message', filter);
}

function filter(message) {
    var channelinfo = null;

    for (var i = 0; i < config.length; i++) {
        if (config.channels[i].channel == message.channel.name) {
            channelinfo = config[i];
        }
    }

    if (channelinfo == null) {
        channelinfo = config.channels[0];
    }
    
    var blacklist = channelinfo.blacklist;
    if (blacklist == null) {
        blacklist = config.channels[0].blacklist;
    }

    for (var i = 0; i < blacklist.length; i++) {
        var search = blacklist[i];
        if (config.useRegEx) {
            search = stringToRegex(blacklist[i]);
        }

        if (message.content.search(search) != -1) {
            message.delete();
            return;
        }
    }

    var whitelist = channelinfo.whitelist;
    if (whitelist == null) {
        whitelist = config.channels[0].whitelist;
    }

    for (var i = 0; i < whitelist.length; i++) {
        var search = whitelist[i];
        if (config.useRegEx) {
            search = stringToRegex(whitelist[i]);
        }

        if (message.content.search(search) == -1) {
            message.delete();
            return;
        }
    }
}

function stringToRegex(str) {
    var l = str.lastIndexOf("/");
    var regex = new RegExp(str.slice(1, l), str.slice(l + 1));
    return regex;
}
