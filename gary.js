var Discord = require('discord.js'),
    config = require('./config.json'),
    plugins = require('./plugins.js'),
    package = require('./package.json');

if (config.token == '' || config.prefix == '' || config.ownerID == '') {
    console.log('Please fill in config.json');
    process.exit(1);
}

var client = new Discord.Client();
var commands = {};
plugins.init(commands, client, config);

client.on('error', console.error);

client.on('ready', () => {
    var serversCount = client.guilds.size;
    console.log(`Gary ready! Serving ${serversCount} servers.`);

    client.user.setStatus('online'); //online, idle, dnd, invisible
    client.user.setPresence({ game: { name: config.prefix + 'help | v' + package.version, type:0 } });
});

client.on('message', message => {
    var msgcontent = message.content
    if (message.content.includes(config.prefix) && message.channel.type === 'dm') {
        message.author.send("**ACCESS DENIED**\nTry again on the server in the appropriate channel.");
        return;
    }

    if (message.content.includes("discord.gg")) {
        var role = message.guild.roles.find("name", "Mod");
        var member = message.member;
        if (!message.member.roles.has(role.id))
            message.delete();
    }

    if (!message.content.startsWith(config.prefix))
        return;

    // All commands should be immediately deleted

    // Handle commands
    const args = message.content
        .slice(1)
        .trim()
        .split(/ +/g);

    const command = args.shift().toLowerCase();

    if (command in commands) {
        commands[command].process(message, args);
    }
});

client.login(config.token);
