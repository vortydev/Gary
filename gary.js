var Discord = require('discord.js'),
    config = require('./config.json'),
    plugins = require('./plugins.js'),
    package = require('./package.json'),
    permissions = require('./permissions.js'),
    Logger = require('./logger.js'),
    messager = require('./messager.js');

if (config.token == '' || config.prefix == '') {
    Logger.error('Please fill in config.json');
    process.exit(1);
}

var client = new Discord.Client();
var commands = {};
plugins.init(commands, client, config, package, Logger);

client.on('error', err => {
    if (err.code && err.code == 'ECONNRESET') {
        Logger.error('Connection reset', "gary");
        return;
    }

    Logger.error(err, "gary");
});

client.on('ready', () => {
    var serversCount = client.guilds.size;

    Logger.log('Gary v' + package.version + ' ready');
    Logger.log('Serving ' + serversCount + ' servers.');

    client.user.setStatus('online'); //online, idle, dnd, invisible
    client.user.setPresence({ game: { name: config.prefix + 'help | v' + package.version, type:0 } });
});

client.on('message', message => {
    var msgcontent = message.content
    if (message.content.includes(config.prefix) && message.channel.type === 'dm') {
        messager.send(message.author, '**ACCESS DENIED**\nI don\'t respond to DMs. Please talk to me on the server you found me on!');
        return;
    }

    if(message.author.bot || !message.content.startsWith(config.prefix))
        return;

    var args = message.content
        .slice(1)
        .trim()
        .split(/ +/g);

    var channel = message.channel;
    var commandName = args.shift().toLowerCase();

    if (commandName in commands) {
        message.delete()
            .then(() => {
                if (permissions.hasPermission(message.member, commandName, args)) {
                    if (!isCorrectChannel(commandName, channel)) {
                        messager.reply(message, 'this is not the correct channel for this command', true);
                        return;
                    }
                    var command = commands[commandName];
                    Logger.logCommand(message);
                    command.process(message, args);
                }
            })
            .catch(e => {
                // Message was already deleted
                if (e.message == 'Unknown Message')
                    return;

                Logger.error(e);
            });
    }
    else {
        if (!config.ignoreNonCommands) {
            message.delete()
                .catch(e => {
                    if (e.message == 'Unknown Message')
                        return;

                    Logger.error(e);
                });
        }
    }
});

function isCorrectChannel(commandName, channel) {
    var inConfig = false;

    for (var i = 0; i < config.lockedCommands.length; i++) {
        if (config.lockedCommands[i].name == commandName) {
            inConfig = true;
            if (config.lockedCommands[i].channels.length == 0) {
                return true;
            }
            for (var x = 0; x < config.lockedCommands[i].channels.length; x++) {
                if (config.lockedCommands[i].channels[x] == channel.name) {
                    return true;
                }
            }
        }
    }

    if (!inConfig)
        return true;

    return false;
}

client.login(config.token);
