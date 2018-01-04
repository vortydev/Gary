var ownerId;
var botClient;
var prefix;

exports.commands = [
    'say',
    'setgame',
    'setstatus',
    'setnickname',
    'reset',
    'purge'
]

exports.init = function (client, config) {
    botClient = client;
    ownerId = config.ownerID;
    prefix = config.prefix;
}

exports['say'] = {
    process: function (message, args) {
        if (message.author.id != ownerId)
            return;

        message.channel.send(args.join(' '));
    }
}

exports['setgame'] = {
    process: setGame
}

exports['setstatus'] = {
    process: setStatus
}

exports['setnickname'] = {
    process: setNickname
}

exports['reset'] = {
    process: function (message, args) {
        setGame(message, [ prefix + ' help' ]);
        setStatus(message, [ 'online' ]);
        setNickname(message, [ '' ]);
    }
}

exports['purge'] = {
    process: function (message, args) {
        if (message.author.id != ownerId)
            return;
       
        var number = parseInt(args[0]);
        if (!number) 
            return;
        
        message.channel.bulkDelete(number + 1, false)
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

