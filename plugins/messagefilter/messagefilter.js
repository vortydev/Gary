var self = this;

self.config = null;
self.fullconfig = null;
self.prefix = null;
self.logger = null;

var allChannels = null;

exports.init = function (context) {
    self.config = context.config.messageFilter;
    self.fullconfig = context.config;
    self.prefix = context.config.prefix;
    self.logger = context.logger;

    for (var i = 0; i < self.config.channels.length; i++) {
        if (self.config.channels[i].channel == "*") {
            allChannels = i;
        }
    }

    context.client.on('message', filter);
}

function filter(message) {
    if (message.channel.type == 'dm' || message.author.bot || self.config.channels.length < 1 || message.content.startsWith(self.prefix))
        return;

    for (var i = 0; i < self.fullconfig.immuneRoleNames.length; i++) {
        var immuneRole = message.guild.roles.find(r => r.name == self.fullconfig.immuneRoleNames[i]);
        if (immuneRole == null) {
            self.logger.log("You have specified a role named '" + self.fullconfig.immuneRoleNames[i] + "' in the config's immune roles, but this role does not exist!")
            return;
        }
        if (message.member.roles.has(immuneRole.id))
            return;
    }

    var channelinfo = null;
    var blacklist = null;
    var whitelist = null;

    for (var i = 0; i < self.config.channels.length; i++) {
        if (self.config.channels[i].channel == message.channel.name) {
            channelinfo = self.config.channels[i];
        }
    }

    if (channelinfo != null) {
        if (channelinfo.blacklist != null) {
            blacklist = channelinfo.blacklist;
            for (var i = 0; i < blacklist.length; i++) {
                var search = new RegExp(blacklist[i]);
                if (!self.config.caseSensitive) {
                    search = new RegExp(blacklist[i], 'i');
                }
                if (message.content.search(search) != -1) {
                    message.delete()
                        .then(() => {
                            var name = message.member.displayName;
                            var content = message.content;
                            self.logger.log(`Deleted blacklisted message: ${name}: ${content}`, 'msgfilter');
                        })
                        .catch(self.logger.error);
                    return;
                }
            }
        }
        if (channelinfo.whitelist != null) {
            whitelist = channelinfo.whitelist;
            for (var i = 0; i < whitelist.length; i++) {
                var search = new RegExp(whitelist[i]);
                if (!self.config.caseSensitive) {
                    search = new RegExp(whitelist[i], 'i');
                }
                if (message.content.search(search) == -1 && !message.author.bot) {
                    message.delete()
                        .catch(self.logger.error);
                    return;
                }
            }
        }
    }

    if (allChannels == null)
        return;

    if (self.config.channels[allChannels].blacklist != null) {
        blacklist = self.config.channels[allChannels].blacklist;
        for (var i = 0; i < blacklist.length; i++) {
            var search = new RegExp(blacklist[i]);
            if (!self.config.caseSensitive) {
                search = new RegExp(blacklist[i], 'i');
            }
            if (message.content.search(search) != -1) {
                message.delete()
                    .then(() => {
                        self.logger.log(`Deleted blacklisted message: ${message.member.displayName}: ${message.content}`, 'msgfilter');
                    })
                    .catch(self.logger.error);
                return;
            }
        }
    }

    if (self.config.channels[allChannels].whitelist != null) {
        whitelist = self.config.channels[allChannels].blacklist;
        for (var i = 0; i < whitelist.length; i++) {
            var search = new RegExp(blacklist[i]);
            if (!self.config.caseSensitive) {
                search = new RegExp(blacklist[i], 'i');
            }
            if (message.content.search(search) != -1) {
                message.delete()
                    .catch(self.logger.error);
                return;
            }
        }
    }
}
