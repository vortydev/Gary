var self = this;

var adminConfig = require('./adminconfig.json');

var ownerId;
var prefix;
var version;

self.client = null;
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
    self.logger = logger;

    ownerId = config.ownerID;
    prefix = config.prefix;
    version = package.version;

    if (adminConfig.muteRoleName) {
        self.muteRole = adminConfig.muteRoleName;
        self.logger.logStr('set muted role to: ' + self.muteRole);
    } 
}

exports['say'] = {
    usage: 'say <message> | Have the bot say a message',
    process: function (message, args) {
        message.channel.send(args.join(' '))
            .catch(console.error);
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
    usage: 'purge <number> | Bulk delete most recent messages in a channel',
    process: function (message, args) {
        var number = parseInt(args[0]);
        if (!number || number <= 1)
            return;

        message.channel.bulkDelete(number, false)
            .then(() => { })
            .catch(() => { });
    }
}

exports['ping'] = {
    usage: 'Get bot response time',
    process: function (message, args) {
        message.channel.send('Latency of **' + Math.round(self.client.ping) + '** ms')
            .then(() => { })
            .catch(() => { });
    }
}

exports['tempmute'] = {
    usage: 'mute <mention> <time> | Mute a user for <time> seconds',
    process: function (message, args) {
        if (args.length != 2) 
            return;

        var target = message.mentions.members
            .map((member, _) => member)[0];

        if (!target)
            return;

        var seconds = args[1];
        
        var muteRole = message.guild.roles.find('name', self.muteRole);
        if (!muteRole) {
            self.logger.logStr('Unable to mute: couldn\'t find role' + self.muteRole);
            return;
        }

        target.addRole(muteRole)
            .then(() => {
                self.logger.logStr('Muting ' + target.user.username + ' for ' + seconds + ' seconds');
                target.send('You have been muted by ' + message.member.displayName + ' for ' + seconds + ' seconds.')
                    .catch(self.logger.logError);

                // ?!?!
                ((s) => new Promise((r, _) => setTimeout(r, s * 1000)))(seconds)
                    .then(() => {
                        target.removeRole(muteRole)
                            .then(() => {
                                self.logger.logStr('Unmuting ' + target.user.username);
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
        .then(() => { })
        .catch(() => { });
}

function setStatus(message, args) {
    self.client.user.setStatus(args.join(' ')); // online, idle, dnd, invisible
}

function setNickname(message, args) {
    message.guild.member(self.client.user)
        .setNickname(args.join(' '));
}
