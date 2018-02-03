var self = this;

var ownerId;
var prefix;
var version;

self.client = null;
self.config = null;
self.logger = null;
self.muteRole = '';

exports.commands = [
    'say',
    'setgame',
    'setstatus',
    'setnickname',
    'reset',
    'purge',
    'ping',
    'tempmute'
]

exports.init = function (client, config, package, logger) {
    self.client = client;
    self.config = config;
    self.logger = logger;

    ownerId = config.ownerID;
    prefix = config.prefix;
    version = package.version;

    if (self.config.muteRoleName) {
        self.muteRole = self.config.muteRoleName;
        self.logger.log('set muted role to: ' + self.muteRole, 'admin');
    }
}

exports['say'] = {
    usage: 'say <message> | Have the bot say a message',
    process: function (message, args) {
        message.channel.send(args.join(' '))
            .catch(self.logger.error);
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

exports['purge'] = {
    usage: 'purge <number> (@user) | Delete the last <number> messages in a channel (by @user)',
    process: function (message, args) {
        var number = parseInt(args[0]);
        if (!number)
            return;

        if (number > 99 || number < 0) {
            message.reply("there is a maxiumum value of 99 messages and a minimum value of 0.")
                .then((msg) => { msg.delete(5000) })
                .catch(self.logger.error);
            return;
        }

        var target = message.mentions.members
            .map((member, _) => member)[0];

        if (target != null) {
            var sorted = [];

            message.channel.fetchMessages({ limit: 100 })
                .then(messages => {
                    messages = messages.array();

                    for (var i = 0; i < messages.length; i++) {
                        if (messages[i].member == target && sorted.length < number) {
                            sorted.push(messages[i]);
                        }
                    }

                    message.channel.send(`Deleting ${sorted.length} messages by ${target.user.tag} in this channel.`)
                        .then(m => {
                            var delay = 2000;
                            ((t) => {
                                var start = new Date().getTime();
                                for (var i = 0; i < 1e7; i++) {
                                    if ((new Date().getTime() - start) > t)
                                        break;
                                }
                            })(delay);

                            m.delete()
                                .catch(self.logger.error);
                            for (var x = 0; x < sorted.length; x++) {
                                sorted[x].delete()
                                    .catch(self.logger.error);
                            }
                        })
                        .catch(self.logger.error);
                })
                .catch(self.logger.error);
            return;
        }

        message.channel.send("Deleting the last " + number + " message(s)...")
            .then(m => {
                var delay = 2000;
                ((t) => {
                    var start = new Date().getTime();
                    for (var i = 0; i < 1e7; i++) {
                        if ((new Date().getTime() - start) > t)
                            break;
                    }
                })(delay);

                message.channel.bulkDelete(number + 1, false)
                    .catch(self.logger.error);
            })
            .catch(self.logger.error);
        }
}

exports['ping'] = {
    usage: 'Get bot response time',
    process: function (message, args) {
        message.channel.send('Latency of **' + Math.round(self.client.ping) + '** ms')
            .catch(self.logger.error);
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
                message.reply("I cannot mute this member!")
                    .then((msg) => { msg.delete(5000) })
                    .catch(self.logger.error);
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
            message.reply("that user is already muted!")
                .then((msg) => { msg.delete(5000) })
                .catch(self.logger.error);
            return;
        }

        target.addRole(muteRole)
            .then(() => {
                self.logger.log('Muting ' + target.user.username + ' for ' + seconds + ' seconds', 'admin');
                target.send('You have been muted by ' + message.member.displayName + ' for ' + seconds + ' seconds.')
                    .catch(self.logger.error);

                // ?!?!
                ((s) => new Promise((r, _) => setTimeout(r, s * 1000)))(seconds)
                    .then(() => {
                        if (target == null || !target.roles.find("name", self.config.muteRoleName))
                            return;

                        target.removeRole(muteRole)
                            .then(() => {
                                self.logger.log('Unmuting ' + target.user.username, 'admin');
                                target.send('You have been unmuted.')
                                    .catch(self.logger.logError);
                            })
                            .catch(self.logger.logError);
                    });
            })
            .catch(self.logger.logError);
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
