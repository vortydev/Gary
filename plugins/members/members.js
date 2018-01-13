var self = this;

var Discord = require('discord.js'),
    fs = require('fs');

var logChannelName = 'member-log';
var welcomeTextPath = './plugins/members/welcome.md';
var rulesTextPath = './plugins/members/rules.md';
var welcomeText;

self.client = null;
self.logger = null;

exports.commands = [
    'rules',
    'members',
    'avatar',
    'joined'
];

exports.init = function (client, config, package, logger) {
    fs.readFile(welcomeTextPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        welcomeText = data;
    });

    self.client = client;
    self.logger = logger;

    client.on('guildMemberAdd', memberAdd);
    client.on('guildMemberRemove', memberRemove);
}

// Commands
exports['members'] = {
    usage: 'Gets how many people are on the server',
    process: function (message) {
        message.channel.send("There are currently **" + message.guild.memberCount + "** members on this server.");
    }
}

exports['avatar'] = {
    usage: 'Sends author his avatar',
    process: function (message, args) {
        var embed = new Discord.RichEmbed()
            .setColor(0x7a7a7a)
            .setDescription('[Direct Link](' + message.author.avatarURL + ')')
            .setImage(message.author.avatarURL)
            .setFooter('Brought to you by TheV0rtex™');

        message.reply('your avatar:');
        message.channel.send({ embed: embed })
            .then(() => { })
            .catch(console.error);
    }
}

exports['rules'] = {
    usage: 'DM the user with rules',
    process: function (message, args, client) {
        fs.readFile(rulesTextPath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            var embed = new Discord.RichEmbed()
                .setColor(0x7a7a7a)
                .setTitle('Rules')
                .setAuthor(client.user.username, client.user.avatarURL)
                .setDescription(data);

            message.reply('rules have been sent.')
                .then(m => m.delete(5000))
                .catch(console.error);

            message.author.send({ embed: embed })
                .then(() => { })
                .catch(console.error);
        });
    }
}

exports['joined'] = {
    usage: "Gets author's date and time of arrival on the server",
    process: function (message, args) {
        var member = message.channel.guild.fetchMember(message.author)
            .then(member => {
                var date = member.joinedAt;

                var year = date.getFullYear();
                var month = date.getMonth() + 1;
                var day = date.getDate();
                var hours = date.getHours();
                var mins = date.getMinutes();

                var end = "**" + day.toString() + "/" + month.toString() + "/" + year.toString() + "** at " + hours.toString() + ":";

                if (mins.toString().length == 1)
                    end += "0";

                end += mins.toString();

                //NameHere joined on 30/12/2017 at 16:56
                message.reply("you joined on " + end)
                    .then(() => { })
                    .catch(() => { });
            });
   }
}

function memberAdd(member) {
    log(member, 'joined the server', 0x18bb68);

    var embed = new Discord.RichEmbed()
        .setColor(0x7a7a7a)
        .setTitle('Welcome!')
        .setAuthor(self.client.user.username, self.client.user.avatarURL)
        .setDescription(welcomeText)
        .setTimestamp();

    member.send({ embed: embed })
        .then(() => { })
        .catch(() => { });
}

function memberRemove(member) {
    log(member, 'left the server', 0xff8c00);
}

function log(member, message, colour) {
    var channel = member.guild.channels.find('name', logChannelName);
    self.logger.logStr(member.user.username + ' ' + message);

    if (!channel) {
        self.logger.logStr('no #' + logChannelName + ' on this server');
        return;
    }
    
    var embed = new Discord.RichEmbed()
        .setColor(colour)
        .setAuthor(self.client.user.username, self.client.user.avatarURL)
        .setDescription('<@' + member.user.id + '> ' + message)
        .setTimestamp();

    channel.send({ embed: embed });
    
}
