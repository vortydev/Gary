const Discord = require('discord.js');
const client = new Discord.Client();
var https = require('https');
var http = require('http');

const config = require('./config.json');
var token = config.token;
var prefix = config.prefix;
var ownerID = config.ownerID;

if (token == '' || prefix == '' || ownerID == '') {
    console.log('Please fill in config.json');
    process.exit(1);
}

const TairaGamesDevSquad = "279771993681952769";
const Clink = "265167936119898122";
const monodokimes = "176799548532981760";


var commands = {};
var plugins = require('./plugins.js');
plugins.init(commands, client, config);

client.on('error', (e) => console.error(e));

client.on('ready', () => {
           var serversCount = client.guilds.size;
           var usersCount = client.users.size;
           console.log(`Gary ready! Serving ${serversCount} servers.`);
           client.user.setStatus('online'); //online, idle, dnd, invisible
           client.user.setPresence({game:{name:'*help', type:0}});
         });

client.on('message', message => {
    var msgcontent = message.content
    if (message.content.includes("*") && message.channel.type === 'dm') {
        message.author.send("**ACCESS DENIED**\nTry again on the server in the appropriate channel.");
        return;
    }

    if (message.content.includes("discord.gg")) {
        let role = message.guild.roles.find("name", "Mods");
        let member = message.member;
        if (!message.member.roles.has(role.id)) message.delete();
    }

    if (!message.content.startsWith(config.prefix)) 
        return;

    // All commands should be immediately deleted
    message.delete()
        .then(() => { })
        .catch(console.error);

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

client.login(token);
// invite: https://discordapp.com/oauth2/authorize?client_id=334058663239221254&scope=bot&permissions=8
