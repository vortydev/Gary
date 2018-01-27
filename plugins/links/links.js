var self = this;

var Discord = require("discord.js");
var links = require('./links.json');

self.logger = null;
self.config = null;

exports.commands = [
    'link'
];

exports.init = function (client, config, _, logger) {
    self.config = config;
    self.logger = logger;
}

exports['link'] = {
    usage: "link - Gets a list of all links | link link-name - Displays the link 'link name'",
    process: function (message, args) {
        if (args[0] == null) {
            var embed = new Discord.RichEmbed()
                .setColor(parseInt(self.config.embedCol, 16))
                .setTitle("All Links");
            
            var text = "";
            for (var i = 0; i < links.length; i++) {
                text += "`" + links[i].name + "` - " + links[i].description + "\n";
            }

            embed.setDescription(text);
            message.channel.send({ embed });
            return;
        }

        var x = null;

        for (var i = 0; i < links.length; i++) {
            if (links[i].name.toLowerCase() == args[0].toLowerCase())
                x = i;
        }

        if (x == null) {
            message.reply("the link `" + args[0].toLowerCase() + "` does not exist.")
                .then((msg) => { msg.delete(5000) })
                .catch(self.logger.error);
            return;
        }
        
        var embed = new Discord.RichEmbed()
            .setColor(parseInt(self.config.embedCol, 16))
            .setTitle(links[x].link)
            .setDescription(links[x].description);

        message.channel.send({ embed });
    }
}
