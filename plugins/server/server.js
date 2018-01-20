var self = this;

var Discord = require("discord.js");

self.config = null;
self.logger = null;

exports.commands = [
    'emojilist'
];

exports.init = function (client, config, _, logger) {
    self.config = config;
    self.logger = logger;
}

exports['emojilist'] = {
    usage: 'Get the servers custom emoji',
    process: function (message, args) {
        
        if (message.guild.emojis.array().length == 0) {
            message.reply("there are no custom emoji on this server.")
                .then((msg) => { msg.delete(5000) })
                .catch(self.logger.error);
            return;
        }
        
        var emojiList = message.guild.emojis.map(i => i.toString()).join(" ");

        var embed = new Discord.RichEmbed()
            .setColor(parseInt(self.config.embedCol, 16))
            .setTitle("Custom Emoji:")
            .setDescription(emojiList);

        message.channel.send({ embed })
            .catch(self.logger.error);
    }
}