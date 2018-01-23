var Discord = require('discord.js'),
    config = require('./config.json'),
    plugins = require('./plugins.js'),
    package = require('./package.json'),
    permissions = require('./permissions.js'),
    Logger = require('./logger.js');

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
        message.author.send("**ACCESS DENIED**\nTry again on the server in the appropriate channel.");
        return;
    }
    
    if(message.author.bot)
        return;

    if (!message.content.startsWith(config.prefix))
        return;

    // All commands should be immediately deleted
    message.delete()
        .then(() => { 
            // Handle commands
            var args = message.content
                .slice(1)
                .trim()
                .split(/ +/g);

            var commandName = args.shift().toLowerCase();

            if (commandName in commands) {
                if (permissions.hasPermission(message.member, commandName, args)) {
                    var command = commands[commandName];
                    Logger.logCommand(message);
                    command.process(message, args);
                }
            }
        })
        .catch(e => {
            // Message was already deleted
            if (e.message == 'Unknown Message') 
                return; 
            
            Logger.error(e);
        });
});

client.login(config.token);
