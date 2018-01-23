var self = this;

var Discord = require('discord.js'),
    fs = require('fs'),
    path = require('path'),
    permissions = require('./permissions.js'),
    package = require('./package.json');

var pluginDirectory = './plugins/';
var pluginFolders = null;

self.client = null;
self.commands = null;
self.config = null;
self.plugins = [];
self.logger = null;

var specialCommands = [
    {
        name: 'help',
        command: {
            usage: 'Send the user a list of available commands',
            process: help
        }
    },
    {
        name: 'version',
        command: {
            usage: 'Get the current version',
            process: version
        }
    },
    {
        name: 'uptime',
        command: {
            usage: 'Get uptime',
            process: uptime
        }
    },
    {
        name: 'stop',
        command: {
            usage: 'Kill bot process',
            process: stop
        }
    }
]

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath)
        .filter(f => {
            return fs.statSync(path.join(srcPath, f))
                .isDirectory();
        });
}

exports.init = function (commands, client, config, package, logger) {
    self.client = client;
    self.commands = commands;
    self.config = config;
    self.logger = logger;

    if (!fs.existsSync(pluginDirectory)) {
        self.logger.error('No plugins directory available');
    } else {
        pluginFolders = getDirectories(pluginDirectory);
    }
   
    for (var i = 0; i < pluginFolders.length; i++) {
        self.logger.log('loading plugin: ' + pluginFolders[i], 'plugins');

        try {
            var plugin = require(pluginDirectory + pluginFolders[i]);
            plugin.init(client, config, package, logger);

            if (!('commands' in plugin))
                continue;           
            
            for (var j = 0; j < plugin.commands.length; j++) {
                if (plugin.commands[j] in plugin) {
                    commands[plugin.commands[j]] = plugin[plugin.commands[j]];
                    self.logger.log(':: loaded command: ' + plugin.commands[j], pluginFolders[i]);
                }
            }

            self.plugins.push({ name: pluginFolders[i], plugin: plugin});
        } catch (err) {
            self.logger.error(pluginFolders[i] + ' failed to load: ' + err, "plugins");
        }
    } 

    self.logger.log('loading default commands', 'plugins');
    for (var i = 0; i < specialCommands.length; i++) {
        var commandData = specialCommands[i];
        commands[commandData.name] = commandData.command;
        self.logger.log(':: loaded command: ' + commandData.name, 'plugins');
    }
}

function help(message) {
    var result = '';
    var member = message.member;
    
    for (var i = 0; i < specialCommands.length; i++) {
        var commandData = specialCommands[i];
        if(!permissions.hasPermission(member, commandData.name))
            continue;

        result += '`' + self.config.prefix + commandData.name + '` - ';
        result += commandData.command.usage + '\n';
    }

    result += '\n';

    var pluginOrder = require('./pluginorder.json');
    
    for (var p = 0; p < pluginOrder.length; p++) {
        var pluginData = self.plugins.find(pd => pd.name == pluginOrder[p]);
        if (!pluginData) 
            continue;

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
        .setColor(parseInt(self.config.embedCol, 16))
        .setTitle(self.client.user.username + ' Commands')
        .setDescription(result)
        .setThumbnail(self.client.user.avatarURL)
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

function stop(message) {
    self.logger.log('Stopping...', message.member.displayName);
    process.exit(0);
}

function uptime(message) {
    var date = new Date(new Date() - self.client.readyAt);

    var embed = new Discord.RichEmbed()
        .setColor(parseInt(self.config.embedCol, 16))
        .setTitle("Uptime")
        .setDescription(`I have been online for ${Math.floor(date.getTime() / 86400000)} days, ${date.getHours()} hours and ${date.getMinutes()} minutes.`)
        .setFooter(new Date());

    message.channel.send({ embed })
        .catch(self.logger.error);
}
