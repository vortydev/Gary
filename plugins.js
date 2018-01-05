var Discord = require('discord.js'),
    fs = require('fs'),
    path = require('path');

var pluginDirectory = './plugins/';
var pluginFolders;

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath)
        .filter(f => {
            return fs.statSync(path.join(srcPath, f))
                .isDirectory();
        });
}

if (!fs.existsSync(pluginDirectory)) {
    console.log('No plugins directory available');
} else {
    pluginFolders = getDirectories(pluginDirectory);
}

exports.init = function (commands, client, config) {
    for (var i = 0; i < pluginFolders.length; i++) {
        var plugin;
        try {
            plugin = require(pluginDirectory + pluginFolders[i]);
        } catch (err) {
            console.log(pluginFolders[i] + ' failed to load: ' + err);
        }

        if (plugin) {
            plugin.init(client, config);
            console.log('loading plugin: ' + pluginFolders[i]);
            if ('commands' in plugin) {
                for (var j = 0; j < plugin.commands.length; j++) {
                    if (plugin.commands[j] in plugin) {
                        commands[plugin.commands[j]] = plugin[plugin.commands[j]];
                        console.log(':: loaded command: ' + plugin.commands[j]);
                    }
                }
            }
        }
    }

    console.log('loading special commands');
    // TODO: Filter available commands based on user perms
    commands['help'] = {
        usage: 'Send the user a list of available commands',
        process: function (message, args) {
            message.delete();
            var result = '';
            for (commandName in commands) {
                var command = commands[commandName];
                var commandText = config.prefix + commandName + ' - ';

                if (command.usage) {
                    commandText += command.usage;
                } else {
                    commandText += 'No usage defined';
                }

                result += commandText + '\n';
            }

            var embed = new Discord.RichEmbed()
                .setColor(0x7a7a7a)
                .setTitle('Gary Commands')
                .setDescription(result)
                .setThumbnail('https://imgur.com/lVpLGeA.png')
                .setFooter('For additional help, contact TheV0rtex#4553')
                .setTimestamp();

            message.reply('help has been sent.')
                .then(m => m.delete(5000))
                .catch(console.error);

            message.author.send({ embed: embed })
                .then(() => { })
                .catch(console.error);

        }
    }
    console.log(':: loaded command: help');
}
