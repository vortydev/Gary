var ownerId;
var botClient;
var prefix;

exports.commands = [
    'say',
    'setgame',
    'setstatus',
    'setnickname',
    'reset',
    'purge',
    'ping'
]

exports.init = function (client, config) {
    botClient = client;
    ownerId = config.ownerID;
    prefix = config.prefix;
}

exports['say'] = {
    usage: 'say <message> | Have the bot say a message',
    process: function (message, args) {
        if (message.author.id != ownerId)
            return;

        message.channel.send(args.join(' '));
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
        setGame(message, [ prefix + 'help' ]);
        setStatus(message, [ 'online' ]);
        setNickname(message, [ '' ]);
    }
}

exports['purge'] = {
    usage: 'purge <number> | Bulk delete most recent messages in a channel',
    process: function (message, args) {
        if (message.author.id != ownerId)
            return;

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
        if (message.author.id != ownerId)
            return;

        message.channel.send('Latency of **' + Math.round(botClient.ping) + '** ms')
            .then(() => { })
            .catch(() => { });
    }
}

function setGame(message, args) {
    if (message.author.id != ownerId)
        return;

    botClient.user
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
    if (message.author.id != ownerId)
        return;

    if (!botClient.user)
        return;

    botClient.user.setStatus(args.join(' ')); // online, idle, dnd, invisible
}

function setNickname(message, args) {
    if (message.author.id != ownerId)
        return;

    var user = botClient.user;
    if (!user)
        return;

    message.guild.member(user)
        .setNickname(args.join(' '));
}
