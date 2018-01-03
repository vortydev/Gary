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

    if (message.author.bot) {
        if (message.content.includes("help has been sent.")) 
            message.delete(5000);
        
        if (message.content.includes("rules have been sent.")) 
            message.delete(5000);
        
        if (message.content.includes("you do not have the permission to use this command.")) 
            message.delete(5000);
        
        if (message.content.includes("you already have this role!")) 
            message.delete(5000);
        
        if (message.content.includes("only mods are permitted to pin messages.")) 
            message.delete(5000);
        
        if (message.content.includes("**[Scanning complete]**\nHuman detected. Access denied.")) 
            message.delete(5000);
        
        if (message.content.includes("You flipped **" && "** !")) 
            message.delete(5000);
        
        if (message.content.includes("Your total number is **" && "** !")) 
            message.delete(10000);
        
        if (message.content.includes("you rolled **" && "-sided die(s).")) 
            message.delete(5000);
        
        if (message.content.includes("Latency of")) 
            message.delete(5000);
    }

    if (message.content.includes("discord.gg")) {
        let role = message.guild.roles.find("name", "Mods");
        let member = message.member;
        if (!message.member.roles.has(role.id)) message.delete();
    }

    if (!message.content.startsWith(config.prefix)) 
        return;

    // All commands should be immediately deleted
    message.delete();
    // Handle commands
    const args = message.content
        .slice(1)
        .trim()
        .split(/ +/g);

    const command = args.shift().toLowerCase();
    
    if (command in commands) {
        commands[command].process(message);
    }

    if (command === 'help') {
        message.reply("help has been sent.");
        message.delete(5000);
        const helpEmbed = new Discord.RichEmbed()
          .setColor(0x7a7a7a)
          .setTitle("Gary Commands")
          .setDescription("A complete list of the available commands.")
          .setThumbnail("https://imgur.com/lVpLGeA.png")
          .addField("Basic Commands:", // Max 25 fields
                    "`*help ` - Sends the user a list of the available commands.\n"+
                    "`*rules` - Sends the user the rules of the server.\n"+
                    "`*ping` - Checks the bot's latency.\n"+
                    "`*avatar` - Sends the user his own avatar.\n"+
                    "`*coinflip` - Flips a coin.\n"+
                    "`*roll [# of dies] [# of faces]` - Rolls dice with set parameters.")
          .addField("Role Command",
                    "`*role <keyword>` - Will assign the user the said role. The available roles are as follow:\n\n"+
                    "`Artist` **|** `3D Artist` **|** `Animator` **|** `Audio Engineer`\n"+
                    "`Composer` **|** `Designer` **|** `Game Tester` **|** `Marketer`\n"+
                    "`Programmer` **|** `Translator` **|** `Voice Actor` **|** `Writer`\n"+
                    "`Youtuber / Streamer` **|** `Newbies` (Given by default.)",
                     true)
          .addField("Owner Commands:",
                    "`*ping` - Sends the latency of the bot.\n"+
                    "`*member` - Sends the number of members on the server.\n"+
                    "`*memberlist` - Sends a detailed list of members on the server.\n"+
                    "`*gif [keyword]` - Sends a random GIF from the keyword.\n"+
                    "`*say [message]`- Sends the said message as if you were the bot.\n"+
                    "`*setgame [keyword]` - Changes the game the bot is playing.\n"+
                    "`*setstatus [keyword]` - Changes the bot's status.\n"+
                    "`*setnickname [keyword]` - Sets the bot's nickname.\n"+
                    "`*purge [value]` - Deletes a number of messages. (Max 100)",
                     true)
          .setFooter("For additional help, contact TheV0rtex#4553") // , "https://imgur.com/lVpLGeA.png")
          .setTimestamp() // By default today's date.
        message.author.send({embed: helpEmbed});
    }

    if (command === 'rule' || command === 'rules') {
        message.delete(5000);
        message.reply("rules have been sent.");
        const rulesEmbed = new Discord.RichEmbed()
          .setColor(0x7a7a7a)
          .setTitle("TairaGames Dev Squad Rules")
          .setDescription("1. Respect fellow developers.\n"+
          "2. Don't spam.\n"+
          "3. Don't stalk.\n"+
          "4. Do not pretend to be somebody else.\n"+
          "5. Keep each text channel on-topic.\n"+
          "6. Do not send illegal links or files.\n"+
          "7. Do not annoy others in the voice channels.")
          .setTimestamp() // By default today's date.
        message.author.send({embed: rulesEmbed});
    }

    if (command === 'ping') {
        message.delete();
        if (message.author.id !== ownerID) return;
        message.channel.send("Latency of **"+Math.round(client.ping)+"** ms.");
    }

    if (command === 'avatar') {
        message.delete(5000)
        const avatarEmbed = new Discord.RichEmbed()
          .setColor(0x7a7a7a)
          .setDescription("[Direct Link]("+message.author.avatarURL+")")
          .setImage(message.author.avatarURL)
          .setFooter("Brought to you by TheV0rtex™")
        message.reply("your avatar:");
        message.channel.send({embed: avatarEmbed});
    }

    if (command === 'coin' || command === 'coinflip' || command === 'cointoss' || command === 'flip' || command === 'flipcoin') {
        message.delete(5000);
        var flip = Math.floor(Math.random() * 2 + 1);
        if (flip === 1) {
            message.channel.send("You flipped **Tails** !");
        }
        else {
            message.channel.send("You flipped **Heads** !");
        }
    }

    if (command === 'roll') {
        message.delete();
        var messageString = message.content.slice(6);
        var values = messageString.split(" ");
        var die = parseFloat(values[1]);
        var face = parseFloat(values[2]);
        var total = (Math.floor(die * ((Math.random() * face) + 1)));
        message.reply("you rolled **"+die+"** "+face+"-sided die(s).");
        message.channel.send(`Your total number is **${total}** !`);
    }

    if (command === 'say') {
        message.delete();
        if (message.author.id !== ownerID) return;
        msgcontent = message.content.substring(5);
        message.channel.send(msgcontent);
      }

    if (command === 'setgame') {
        message.delete();
        if (message.author.id !== ownerID) return;
        msgcontent = msgcontent.substring(9);
        client.user.setPresence({game:{name:''+msgcontent+'', type:0}});
    }

    if (command === 'setstatus') {
        message.delete();
        if (message.author.id !== ownerID) return;
        msgcontent = msgcontent.substring(11);
        client.user.setStatus(msgcontent);  //online, idle, dnd, invisible
    }

    if (command ==='setnickname') {
        message.delete();
        if (message.author.id !== ownerID) return;
        msgcontent = msgcontent.substring(13);
        message.guild.member(client.user).setNickname(msgcontent);
    }

    if (command === 'reset') {
        message.delete();
        if (message.author.id !== ownerID) return;
        client.user.setPresence({game:{name:'?help', type:0}});
        client.user.setStatus('online');
        message.guild.member(client.user).setNickname('');
    }

    if (command === 'purge') {
        // if (message.author.id !== ownerID) return;
        let role = message.guild.roles.find("name", "Mods");
        let member = message.member;
        if (!message.member.roles.has(role.id)) message.delete();
        if (message.member.roles.has(role.id)) message.channel.bulkDelete(args[0], false);
    }





});

client.login(token);
// invite: https://discordapp.com/oauth2/authorize?client_id=334058663239221254&scope=bot&permissions=8
