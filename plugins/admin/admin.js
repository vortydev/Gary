var ownerId;
var botClient;
var prefix;
var version;

exports.commands = [
    'say',
    'setgame',
    'setstatus',
    'setnickname',
    'reset',
    'purge',
    'ping'
]

exports.init = function (client, config, package) {
    botClient = client;
    ownerId = config.ownerID;
    prefix = config.prefix;
    version = package.version
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
    process: function (message, args, client) {
        setGame(message, [ prefix + 'help | v' + version], client);
        setStatus(message, [ 'online' ], client);
        setNickname(message, [ '' ], client);
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
        message.channel.send('Latency of **' + Math.round(botClient.ping) + '** ms')
            .then(() => { })
            .catch(() => { });
    }
}

function setGame(message, args, client) {
    client.user
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
    client.user.setStatus(args.join(' ')); // online, idle, dnd, invisible
}

function setNickname(message, args) {
    message.guild.member(client.user)
        .setNickname(args.join(' '));
}
