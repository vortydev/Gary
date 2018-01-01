var discord = require('discord.js'),
    fs = require('fs');

var members = {};
var logChannelName = 'member-log';
var welcomeTextPath = 'members/welcome.md';
var welcomeText;

members.init = function (client, config) {
    fs.readFile(welcomeTextPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        welcomeText = data;
    });
    
    client.on('guildMemberAdd', memberAdd);
    client.on('guildMemberRemove', memberRemove);
}

function memberAdd(member) { 
    log(member, member + ' joined the server');

    // TODO: use general roles code for this
    var role = member.guild.roles.find('name', 'Newbies');
    if (role) {
        member.addRole(role)
            .catch(console.error);
    } else {
        console.log('there is no Newbies role on the server');
    }
    
    // This produces an UnhandledPromiseRejectionWarning when special characters
    // are included in welcomeText. Raised an issue at https://github.com/hydrabolt/discord.js/issues/2207
    console.log('IGNORE WARNING MESSAGE'); 
    member.send(welcomeText).catch(console.error);
}

function memberRemove(member) { 
    log(member, member + ' left the server');
}

function log(member, message) {
    var channel = member.guild.channels.find('name', logChannelName);
    if (!channel) {
        console.log('no #' + logChannelName + ' on this server');
        console.log(message);
    } else {
        var embed = new discord.RichEmbed()
            .setColor(0x18bb68)
            .setAuthor('Gary', 'https://imgur.com/lVpLGeA.png')
            .setDescription(message)
            .setTimestamp();

        channel.send({ embed: embed });
    }
}

module.exports = members;
