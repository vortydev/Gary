var self = this;
var botClient;

var Discord = require('discord.js'),
    fs = require('fs'),
    path = require('path'),
    permissions = require('./permissions.js'),
    package = require('./package.json');

var pluginDirectory = './plugins/';
var pluginFolders = null;

self.commands = null;
self.config = null;
self.plugins = [];
self.logger = null;

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath)
        .filter(f => {
            return fs.statSync(path.join(srcPath, f))
                .isDirectory();
        });
}

exports.init = function (commands, client, config, package, logger) {
    self.commands = commands;
    self.config = config;
    self.logger = logger;
    botClient = client;

    if (!fs.existsSync(pluginDirectory)) {
        self.logger.logError('No plugins directory available');
    } else {
        pluginFolders = getDirectories(pluginDirectory);
    }
   
    for (var i = 0; i < pluginFolders.length; i++) {
        var plugin;
        try {
            plugin = require(pluginDirectory + pluginFolders[i]);
        } catch (err) {
            self.logger.logError(pluginFolders[i] + ' failed to load: ' + err);
        }

        if (plugin) {
            self.plugins.push({ name: pluginFolders[i], plugin: plugin});

            plugin.init(client, config, package, logger);
            self.logger.logStr('loading plugin: ' + pluginFolders[i]);
            if ('commands' in plugin) {
                for (var j = 0; j < plugin.commands.length; j++) {
                    if (plugin.commands[j] in plugin) {
                        commands[plugin.commands[j]] = plugin[plugin.commands[j]];
                        self.logger.logStr(':: loaded command: ' + plugin.commands[j]);
                    }
                }
            }
        }
    }

    self.logger.logStr('loading default commands');

    commands['help'] = {
        usage: 'Send the user a list of available commands',
        process: help
    }

    self.logger.logStr(':: loaded command: help');

    commands['version'] = {
        usage: 'Get the current version',
        process: version
    }

    self.logger.logStr(':: loaded command: version');

    commands['stop'] = {
        usage: 'Stop execution',
        process: stop
    }

    self.logger.logStr(':: loaded command: stop');
}

function help(message) {
    var result = '';
    var member = message.member;
    
    result += '`' + self.config.prefix + 'help` - ' + self.commands['help'].usage + '\n\n';

    var pluginOrder = require('./pluginorder.json')
        .sort((a, b) => a.sortOrder - b.sortOrder);
    
    for (var p = 0; p < pluginOrder.length; p++) {
        var pluginData = self.plugins.find(pd => pd.name == pluginOrder[p].name);

        var pluginName = pluginData.name;
        var plugin = pluginData.plugin;

        var commandLines = [];
        for (var c = 0; c < plugin.commands.length; c++) {
            var commandName = plugin.commands[c];
            if (!permissions.hasPermission(member, commandName))
                continue;
            
            var command = plugin[commandName];
            var commandText = '`' + self.config.prefix + commandName + '` - ';

            commandLines.push(commandText + (command.usage ? command.usage : 'No usage defined') + '\n');
        }

        if (commandLines.length) {
            pluginName = pluginName.charAt(0).toUpperCase() + pluginName.slice(1);

            result += '**' + pluginName + '**\n';
            result += commandLines.join('');
            result += '\n';
        } 
    }

    var embed = new Discord.RichEmbed()
        .setColor(0x7a7a7a)
        .setTitle(botClient.user.username + ' Commands')
        .setDescription(result)
        .setThumbnail(botClient.user.avatarURL)
        .setFooter('For additional help, contact TheV0rtex#4553')
        .setTimestamp();

    message.reply('help has been sent.')
        .then(m => m.delete(5000))
        .catch(console.error);

    message.author.send({ embed: embed })
        .then(() => { })
        .catch(console.error);
}

function version(message) {
    message.author.send("Currrently version **" + package.version + "**.");
}

function stop() {
    console.log('stopping bot...');
    process.exit(0);
}
