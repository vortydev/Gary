var self = this;

var fs = require('fs'),
    path = require('path');

var Discord = require("discord.js");
var ud = require("urban-dictionary");
var Dictionary = require("oxford-dictionary-api");

var linksFile = 'links.json';
// this gets set at runtime now
var linksConfig = null;
var app_id = '';
var app_key = '';
var dict = null;

const cooldownMessage = 'please wait a little while before using that command again!';

self.logger = null;
self.config = null;
self.package = null;

exports.commands = [
    'link',
    'define',
    'urban',
    'patchnotes'
];

const defineCooldown = new Set();

exports.init = function (context) {
    self.config = context.config;
    self.logger = context.logger;
    self.package = context.package;

    var linksPath = path.join(__dirname, linksFile);
    if (fs.existsSync(linksPath)) {
        fs.readFile(linksPath, 'utf8', (e, data) => {
            try {

                linksConfig = JSON.parse(data);

                app_id = linksConfig.definitions.app_id;
                app_key = linksConfig.definitions.app_key;

                if (app_id != "" && app_key != "") {
                    dict = new Dictionary(app_id, app_key);
                }
            } catch (e) {
                self.logger.error('links', 'unable to parse links.json');
            }
        });
    } else {
        self.logger.error('links', 'links.json does not exist');
    }
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
        if (defineCooldown.has(message.author.id)) {
          message.reply(cooldownMessage)
            .then(m => m.delete(5000))
            .catch(self.logger.error);
          return;
        }
        defineCooldown.add(message.author.id);
        setTimeout(() => {
          // Removes the user from the set after a minute
          defineCooldown.delete(message.author.id);
        }, linksConfig.defineCooldown * 1000);
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
            if (defineCooldown.has(message.author.id)) {
              message.reply(cooldownMessage)
                .then(m => m.delete(5000))
                .catch(self.logger.error);
              return;
            }
            defineCooldown.add(message.author.id);
            setTimeout(() => {
              // Removes the user from the set after a minute
              defineCooldown.delete(message.author.id);
            }, linksConfig.defineCooldown * 1000);
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
