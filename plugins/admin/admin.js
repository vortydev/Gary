var self = this;

var prefix;
var version;

self.client = null;
self.config = null;
self.logger = null;
self.permissions = null;
self.muteRole = '';
self.messager = null;

exports.commands = [
    'say',
    'setgame',
    'setstatus',
    'setnickname',
    'reset',
    'purge',
    'ping',
    'tempmute',
    'unmute',
    'reloadperms'
]

exports.init = function (context) {
    self.client = context.client;
    self.config = context.config;
    self.logger = context.logger;
    self.permissions = context.permissions;
    self.messager = context.messager;

    prefix = context.config.prefix;
    version = context.package.version;

    if (self.config.muteRoleName) {
        self.muteRole = self.config.muteRoleName;
        self.logger.log('set muted role to: ' + self.muteRole, 'admin');
    }
}

exports['say'] = {
    usage: 'say <message> | Have the bot say a message',
    process: function (message, args) {
        self.messager.send(message.channel, args.join(' '));
    }
}

exports['setgame'] = {
    usage: 'setgame <game> | Set \'playing\'',
    process: setGame
}

exports['setstatus'] = {
    usage: 'setstatus <status> | Set active/away/dnd/invisible',
    process: setStatus
}

exports['setnickname'] = {
    usage: 'setnickname <nick> | Set bot\'s nick',
    process: setNickname
}

exports['reset'] = {
    usage: 'reset | Reset bot\'s \'playing\', status and nickname',
    process: function (message, args) {
        setGame(message, [ prefix + 'help | v' + version]);
        setStatus(message, [ 'online' ]);
        setNickname(message, [ '' ]);
    }
}

const purgeUsage = '`purge <number> [@user]` | Delete the last x messages in a channel, optionally by [@user]';
exports['purge'] = {
    usage: purgeUsage,
    process: function (message, args) {
        var number = parseInt(args[0]);
        if (!number) {
            self.messager.dm(message.author, purgeUsage);
            return;
        }

        if (number > 99 || number < 1) {
            self.messager
                .reply(message, "purge between 1 and 99 messages", true);
            return;
        }

        var target = message.mentions.members
            .map((member, _) => member)[0];

        if (!target) {

            self.messager.send(
                message.channel,
                `Deleting the last ${number} message(s)...`,
                false,
                // Don't delete the message after;
                // the callback will take care of that
                () => {
                    message.channel.bulkDelete(number + 1, false)
                        .catch(self.logger.error);
                });

        } else {

            message.channel.fetchMessages({ limit: 100 })
                .then(messages => {
                    messages = messages.array();

                    var messagesFromTarget = [];
                    for (var i = 0; i < messages.length; i++) {
                        if (messages[i].member == target && messagesFromTarget.length < number) {
                            messagesFromTarget.push(messages[i]);
                        }
                    }

                    var deleteMessages = function (messages) {
                        for (var i = 0; i < messages.length; i++) {
                            messages[i].delete()
                                .catch(self.logger.error);
                        }
                    };

                    self.messager.send(
                        message.channel,
                        `Deleting ${messagesFromTarget.length} messages by ${target.user.tag} in this channel.`,
                        true,
                        () => deleteMessages(messagesFromTarget));
                })
                .catch(self.logger.error);

        }
    }
}

exports['ping'] = {
    usage: 'Get bot response time',
    process: function (message, args) {
        var ping = Math.round(self.client.ping);
        self.messager.send(message.channel, `Latency of **${ping}** ms`);
    }
}

exports['tempmute'] = {
    usage: 'mute <mention> <time> | Mute a user for <time> seconds',
    process: function (message, args) {
        var target = message.mentions.members
            .map((member, _) => member)[0];

        for (var i = 0; i < self.config.immuneRoleNames.length; i++) {
            var immuneRole = message.guild.roles.find(r => r.name == self.config.immuneRoleNames[i]);
            if (target.roles.has(immuneRole.id)) {
                self.messager.reply(
                    message,
                    'I cannot mute this member!',
                    true);

                return;
            }
        }

        if (args.length != 2)
            return;

        if (!target)
            return;

        var seconds = args[1];

        var muteRole = message.guild.roles.find('name', self.muteRole);
        if (!muteRole) {
            self.logger.log('Unable to mute: couldn\'t find role ' + self.muteRole, 'admin');
            return;
        }

        if (target.roles.find("name", self.config.muteRoleName)) {
            self.logger.log("Member already muted.", "admin");
            self.messager.reply(
                message,
                'that user is already muted!',
                true);

            return;
        }

        target.addRole(muteRole)
            .then(() => {
                self.logger.log('Muting ' + target.user.username + ' for ' + seconds + ' seconds', 'admin');

                self.messager.dm(
                    target,
                    `You have been muted by ${message.member.displayName} for ${seconds} seconds.`);

                self.messager.send(
                    message.channel,
                    `${target.displayName} has been muted by ${message.member.displayName} for ${seconds} seconds`,
                    false);

                // ?!?!
                ((s) => new Promise((r, _) => setTimeout(r, s * 1000)))(seconds)
                    .then(() => {
                        if (target == null || !target.roles.find("name", self.config.muteRoleName))
                            return;

                        target.removeRole(muteRole)
                            .then(() => {
                                self.logger.log('Unmuting ' + target.user.username, 'admin');
                                self.messager.dm(
                                    target,
                                    'You have been unmuted');
                            })
                            .catch(self.logger.logError);
                    });
            })
            .catch(self.logger.logError);
    }
}

exports['unmute'] = {
    usage: 'unmute <mention> | Unmute a user',
    process: function (message, args) {
        var target = message.mentions.members
            .map((member, _) => member)[0];

        for (var i = 0; i < self.config.immuneRoleNames.length; i++) {
            var immuneRole = message.guild.roles.find(r => r.name == self.config.immuneRoleNames[i]);
            if (target.roles.has(immuneRole.id)) {
                self.messager.reply(
                    message,
                    'I cannot unmute this member!',
                    true);

                return;
            }
        }

        if (!target)
            return;

        var muteRole = message.guild.roles.find('name', self.muteRole);
        if (!muteRole) {
            self.logger.log('Unable to mute: couldn\'t find role ' + self.muteRole, 'admin');
            return;
        }


        if (!target.roles.find("name", self.config.muteRoleName)) {
            self.logger.log("Member is not muted.", "admin");
            self.messager.reply(
                message,
                'that user is not muted!',
                true);

            return;
        }

        target.removeRole(muteRole)
            .then(() => {
                self.logger.log('Unmuting ' + target.user.username, 'admin');
                self.messager.dm(
                    target,
                    `You have been unmuted by ${message.member.displayName}.`);
                self.messager.send(
                    message.channel,
                    `${target.displayName} has been unmuted by ${message.member.displayName}.`);
            })
            .catch(self.logger.logError);
    }
}

exports['reloadperms'] = {
    usage: 'reloadperms | Reload permissions file',
    process: function (message, args) {
        self.permissions.reloadPermissions();
    }
}

function setGame(message, args) {
    self.client.user
        .setPresence({
            game: {
                name: args.join(' '),
                type: 0
            }
        })
        .catch(self.logger.error);
}

function setStatus(message, args) {
    self.client.user.setStatus(args.join(' ')); // online, idle, dnd, invisible
}

function setNickname(message, args) {
    message.guild.member(self.client.user)
        .setNickname(args.join(' '));
}
