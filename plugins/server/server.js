var self = this;

var Discord = require("discord.js");

self.config = null;
self.logger = null;

exports.commands = [
    'emojilist',
    'serverinfo'
];

exports.init = function (client, config, _, logger) {
    self.config = config;
    self.logger = logger;
}

exports['emojilist'] = {
    usage: 'Get the servers custom emoji',
    process: function (message, args) {
        var embed = new Discord.RichEmbed()
            .setColor(parseInt(self.config.embedCol, 16))
            .setTitle("Custom Emoji:")
            .setDescription(getEmoji(guild))
            .setFooter(new Date())
            .setAuthor(message.author.tag, message.author.avatarURL);

        message.channel.send({ embed })
            .catch(self.logger.error);
    }
}

exports['serverinfo'] = {
    usage: 'Get info about the server',
    process: function (message, args) {
        var guild = message.channel.guild;

        var embed = new Discord.RichEmbed()
            .setColor(parseInt(self.config.embedCol, 16))
            .setThumbnail(guild.iconURL)
            .addField("Created:", getDate(guild.createdAt))
            .addField("Owner:", guild.owner.user.tag)
            .addField("Region:", guild.region)
            .addField("Verification Level:", getVerification(guild))
            .addField("Member Count:", guild.memberCount)
            .addField("Member Status:", getStatus(guild))
            .addField("Channels:", getChannels(guild))
            .addField("Custom Emojis:", getEmoji(guild))
            .setFooter(new Date())
            .setAuthor(message.author.tag, message.author.avatarURL);

        message.channel.send({ embed })
            .catch(self.logger.error);
    }
}

function getDate(date) {
    var str = '';
    str += date.getUTCDate() + '/';
    str += (date.getUTCMonth() + 1) + '/';
    str += date.getUTCFullYear() + ' at ';
    str += date.getUTCHours() + ':';
    str += date.getUTCMinutes() + " (UTC)";
    return str;
}

function getVerification(guild) {
    var verificationLevel = "";
    switch (guild.verificationLevel) {
        case 0: {
            verificationLevel = "None: Unrestricted"
            break;
        }
        case 1: {
            verificationLevel = "Low: Users must have a verified email on their Discord account"
            break;
        }
        case 2: {
            verificationLevel = "Medium: Users must have a verified email on their Discord account and be registered on Discord for longer than 5 minutes"
            break;
        }
        case 3: {
            verificationLevel = "High: Users must have a verified email on their Discord account and be registered on Discord for longer than 5 minutes. Users must also be a member of the server for longer than 10 minutes"
            break;
        }
        case 4: {
            verificationLevel = "Extreme: Users must have a verified phone on their Discord account"
            break;
        }
    }
    return verificationLevel;
}

function getStatus(guild) {
    var status = guild.presences.array();
    var online = 0;
    var idle = 0;
    var dnd = 0;

    for (var i = 0; i < status.length; i++) {
        switch (status[i].status) {
            case "online": {
                online++;
                break;
            }
            case "idle": {
                idle++;
                break;
            }
            case "dnd": {
                dnd++;
                break;
            }
        }
    }

    return `${online} online, ${idle} idle, ${dnd} do not disturb, ${guild.memberCount - (online + idle + dnd)} offline`;
}

function getEmoji(guild) {
    var emoji = "No custom emoji"
    if (guild.emojis.array().length != 0) {
        var emoji = guild.emojis.map(i => i.toString()).join(" ");
    }
    return emoji;
}

function getChannels(guild) {
    var channels = guild.channels.array();
    var text = 0;
    var voice = 0;

    for (var x = 0; x < channels.length; x++) {
        if (channels[x].type == "text") {
            text++
        }
        else {
            voice++
        }
    }

    return `${text} text channels, ${voice} voice channels`;
}
