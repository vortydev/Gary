var self = this;

var Discord = require("discord.js");
var ud = require("urban-dictionary");
var Dictionary = require("oxford-dictionary-api");
var fs = require("fs");
var linksConfig = require('./links.json');

var app_id = linksConfig.definitions.app_id;
var app_key = linksConfig.definitions.app_key;

var dict = null;

if (app_id != "" && app_key != "") {
    dict = new Dictionary(app_id, app_key);
}

self.logger = null;
self.config = null;
self.package = null;

exports.commands = [
    'link',
    'define',
    'urban',
    'patchnotes'
];

exports.init = function (client, config, package, logger) {
    self.config = config;
    self.logger = logger;
    self.package = package;
}

exports['link'] = {
    usage: "link - Gets a list of all links | link link-name - Displays the link 'link name'",
    process: function (message, args) {
        var links = linksConfig.links;

        if (args[0] == null) {
            var embed = new Discord.RichEmbed()
                .setColor(parseInt(self.config.embedCol, 16))
                .setTitle("All Links")
                .setFooter(new Date())
                .setAuthor(message.author.tag, message.author.avatarURL);

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
            .setDescription(links[x].description)
            .setFooter(new Date())
            .setAuthor(message.author.tag, message.author.avatarURL);

        message.channel.send({ embed });
    }
}

exports['define'] = {
    usage: 'define <word> | Get the definition of a word via Oxford Dictionary',
    process: function (message, args) {
        if (dict == null) {
            self.logger.log("The app_id and app_key needed to access the Oxford Dictionary api are either invalid or non-existent.");
            return;
        }
        dict.find(args[0], function (error, data) {
            if (error || !data.results) {
                message.reply('I could not find a definition for this word')
                    .then(m => m.delete(5000))
                    .catch(self.logger.error);
                return;
            }
            var definitions = "";
            var examples = "";
            for (var i = 0; i < data.results[0].lexicalEntries[0].entries[0].senses[0].definitions.length; i++) {
                definitions += (i+1) + ") " + data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[i] + "\n";
            }
            if (data.results[0].lexicalEntries[0].entries[0].senses[0].examples != undefined) {
                for (var i = 0; i < data.results[0].lexicalEntries[0].entries[0].senses[0].examples.length; i++) {
                    examples += (i+1) + ") " + data.results[0].lexicalEntries[0].entries[0].senses[0].examples[i].text + "\n";
                }
            }
            else {
                examples = "None.";
            }
            var embed = new Discord.RichEmbed()
                .setColor(parseInt(self.config.embedCol, 16))
                .setTitle("'" + args[0] + "' definition")
                .setDescription(definitions)
                .addField("Examples", examples);
            message.channel.send({embed})
                .catch(self.logger.error);
        });
    }
}

exports['urban'] = {
    usage: 'urban <word> | Get the definition of a word via Urban Dictionary',
    process: function (message, args) {
        ud.term(args[0], function (error, entries, tags, sounds) {
            if (error) {
                message.reply('I could not find a definition for this word')
                    .then(m => m.delete(5000))
                    .catch(self.logger.error);
                return;
            }
            var embed = new Discord.RichEmbed()
                .setColor(parseInt(self.config.embedCol, 16))
                .setTitle("'" + entries[0].word + "' definition")
                .setDescription(entries[0].definition)
                .addField("Example", entries[0].example);
            message.channel.send({embed})
                .catch(self.logger.error);
        });
    }
}

exports['patchnotes'] = {
    usage: 'patchnotes <version> | Get a version\'s patch notes',
    process: function (message, args) {
        if (args[0] == null) {
            message.channel.send(`https://github.com/TheV0rtex/Gary/releases/tag/v${self.package.version}`)
            return;
        }
        message.channel.send(`https://github.com/TheV0rtex/Gary/releases/tag/v${args[0]}`)
    }
}
