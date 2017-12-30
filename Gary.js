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

var roles = require('./roles/roles.js');
roles.init(client, config);

const TairaGamesDevSquad = "279771993681952769";
const Clink = "265167936119898122";
const monodokimes = "176799548532981760";

client.on('ready', () => {
           var serversCount = client.guilds.size;
           var usersCount = client.users.size;
           console.log(`Gary ready! Serving ${serversCount} servers.`);
           client.user.setStatus('online'); //online, idle, dnd, invisible
           client.user.setPresence({game:{name:'*help', type:0}});
         });

client.on('error', (e) => console.error(e));

// MEMBERS
client.on('guildMemberAdd', member => {
           var serverName = member.guild.name;
           const channel = member.guild.channels.find('name', 'member-log');
           if (!channel) return;
           const joinedEmbed = new Discord.RichEmbed()
             .setColor(0x18bb68)
             .setAuthor("Gary", "https://imgur.com/lVpLGeA.png")
             .setDescription(""+member+" joined the server.")
             .setTimestamp()
           channel.send({embed: joinedEmbed});
           let role = member.guild.roles.find("name", "Newbies");
           member.addRole(role).catch(console.error);
           member.send("Hello "+member+"! Welcome to **TairaGames Dev Squad**!\nWe all hope you enjoy your time here!\n\nMake sure to read the rules by entering the `*rules` command on the server.\n\nTo get started, why not present yourself in **#introductions** and claim your game dev roles in **#role-request**?\n\nWhenever you want to send a rather big chunk of code, please send it in *endented* (``` before and after your code).\n\nIf you have any questions or concerns, do not hesitate to contact the Moderators!");
          });

client.on('guildMemberRemove', member => {
           var serverName = member.guild.name;
           const channel = member.guild.channels.find('name', 'member-log');
           if (!channel) return;
           const leftEmbed = new Discord.RichEmbed()
             .setColor(0xe9890f)
             .setAuthor("Gary", "https://imgur.com/lVpLGeA.png")
             .setDescription(""+member+" left the server.")
             .setTimestamp()
           channel.send({embed: leftEmbed});
         });

client.on('message', message => {
var msgcontent = message.content
if (message.content.includes("*") && message.channel.type === 'dm') {
    message.author.send("**ACCESS DENIED**\nTry again on the server in the appropriate channel.");
    return;
}


if (message.author.bot) {
    if (message.content.includes("help has been sent.")) message.delete(5000);
    if (message.content.includes("rules have been sent.")) message.delete(5000);
    if (message.content.includes("the role has been **added**.")) message.delete(5000);
    if (message.content.includes("the role has been **removed**.")) message.delete(5000);
    if (message.content.includes("the role **Newbies** has also been **removed**.")) message.delete(5000);
    if (message.content.includes("you do not have the permission to use this command.")) message.delete(5000);
    if (message.content.includes("you already have this role!")) message.delete(5000);
    if (message.content.includes("only mods are permitted to pin messages.")) message.delete(5000);
    if (message.content.includes("**[Scanning complete]**\nHuman detected. Access denied.")) message.delete(5000);
    if (message.content.includes("You flipped **" && "** !")) message.delete(5000);
    if (message.content.includes("Your total number is **" && "** !")) message.delete(10000);
    if (message.content.includes("you rolled **" && "-sided die(s).")) message.delete(5000);
    if (message.content.includes("Latency of")) message.delete(5000);
}

// if (msgcontent.includes("(╯°□°）╯︵ ┻━┻")) message.channel.send("┬─┬﻿ ノ( ゜-゜ノ)");
// if (msgcontent.includes("┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻")) message.channel.send("┬─┬﻿ ┬─┬﻿ ノ( ゜-゜ノ)");

// var input = message.content.toLowerCase();
// if (message.content.includes("@334058663239221254")) {
//
// }

if (message.content.includes("discord.gg")) {
    let role = message.guild.roles.find("name", "Mods");
    let member = message.member;
    if (!message.member.roles.has(role.id)) message.delete();
}

if (!msgcontent.startsWith("*")) return;
const args = message.content.slice(1).trim().split(/ +/g);
const command = args.shift().toLowerCase();

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

if (command === 'joined') {
    var member = message.mentions.members.first();

    if (message.mentions.members.array().length < 1) {
        message.channel.send("Please mention a user!")
        return;
    }

    message.channel.send(member.user.username + " joined on " + neatenDate(member.joinedAt));
    //NameHere joined on 30/12/2017 at 16:56
}
   
function neatenDate(date) {
    //Turns an ugly Date into a nice and simple to read one
    //Currently in format DD/MM/YYYY at HH:MM
    //e.g. 30/12/2017 at 16:56
    
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();

    var hours = date.getHours();
    var mins = date.getMinutes();

    var str = day + "/" + month.toString() + "/" + year.toString() + " at " + hours.toString() + ":" + mins.toString();

    if (mins.toString().length == 1)
        str += "0";
    
    return str;
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

if (command === 'members') {
    message.delete();
    if (message.author.id !== ownerID) return;
    message.channel.send("There are currently **"+message.guild.memberCount+"** members on this server.");
}

  if (command === 'memberlist') {
      message.delete();
      if (message.author.id !== ownerID) return;
      let gc = message.guild.memberCount;

      let role1 = message.guild.roles.find("name", "Admin");
      let r1 = role1.members.keyArray().length / gc*100;

      let role2 = message.guild.roles.find("name", "Mods");
      let r2 = role2.members.keyArray().length / gc*100;

      let role3 = message.guild.roles.find("name", "Guru");
      let r3 = role3.members.keyArray().length / gc*100;

      let role4 = message.guild.roles.find("name", "Artist");
      let r4 = role4.members.keyArray().length / gc*100;

      let role5 = message.guild.roles.find("name", "3D Artist");
      let r5 = role5.members.keyArray().length / gc*100;

      let role6 = message.guild.roles.find("name", "Animator");
      let r6 = role6.members.keyArray().length / gc*100;

      let role7 = message.guild.roles.find("name", "Audio Engineer");
      let r7 = role7.members.keyArray().length / gc*100;

      let role8 = message.guild.roles.find("name", "Composer");
      let r8 = role8.members.keyArray().length / gc*100;

      let role9 = message.guild.roles.find("name", "Designer");
      let r9 = role9.members.keyArray().length / gc*100;

      let role10 = message.guild.roles.find("name", "Marketer");
      let r10 = role10.members.keyArray().length / gc*100;

      let role11 = message.guild.roles.find("name", "Voice Actor");
      let r11 = role11.members.keyArray().length / gc*100;

      let role12 = message.guild.roles.find("name", "Translator");
      let r12 = role12.members.keyArray().length / gc*100;

      let role13 = message.guild.roles.find("name", "Writer");
      let r13 = role13.members.keyArray().length / gc*100;

      let role14 = message.guild.roles.find("name", "Youtuber / Streamer");
      let r14 = role14.members.keyArray().length / gc*100;

      let role15 = message.guild.roles.find("name", "Game Tester");
      let r15 = role15.members.keyArray().length / gc*100;

      let role16 = message.guild.roles.find("name", "Programmer");
      let r16 = role16.members.keyArray().length / gc*100;

      let role17 = message.guild.roles.find("name", "Newbies");
      let r17 = role17.members.keyArray().length / gc *100;

      let rr1 = Math.round(r1 * 100) / 100;
      let rr2 = Math.round(r2 * 100) / 100;
      let rr3 = Math.round(r3 * 100) / 100;
      let rr4 = Math.round(r4 * 100) / 100;
      let rr5 = Math.round(r5 * 100) / 100;
      let rr6 = Math.round(r6 * 100) / 100;
      let rr7 = Math.round(r7 * 100) / 100;
      let rr8 = Math.round(r8 * 100) / 100;
      let rr9 = Math.round(r9 * 100) / 100;
      let rr10 = Math.round(r10 * 100) / 100;
      let rr11 = Math.round(r11 * 100) / 100;
      let rr12 = Math.round(r12 * 100) / 100;
      let rr13 = Math.round(r13 * 100) / 100;
      let rr14 = Math.round(r14 * 100) / 100;
      let rr15 = Math.round(r15 * 100) / 100;
      let rr16 = Math.round(r16 * 100) / 100;
      let rr17 = Math.round(r17 * 100) / 100;

      message.channel.send("There are currently **"+gc+"** members on this server:\r\n"+
                            role1.members.keyArray().length+" **Admin** ("+rr1+"%)\r\n"+
                            role2.members.keyArray().length+" **Mods** ("+rr2+"%)\r\n"+
                            role3.members.keyArray().length+" **Gurus** ("+rr3+"%)\r\n"+
                            role4.members.keyArray().length+" **2D Artists** ("+rr4+"%)\r\n"+
                            role5.members.keyArray().length+" **3D Artists** ("+rr5+"%)\r\n"+
                            role6.members.keyArray().length+" **Animators** ("+rr6+"%)\r\n"+
                            role7.members.keyArray().length+" **Audio Engineers** ("+rr7+"%)\r\n"+
                            role8.members.keyArray().length+" **Composers** ("+rr8+"%)\r\n"+
                            role9.members.keyArray().length+" **Designers** ("+rr9+"%)\r\n"+
                            role10.members.keyArray().length+" **Marketers** ("+rr10+"%)\r\n"+
                            role11.members.keyArray().length+" **Voice Actors** ("+rr11+"%)\r\n"+
                            role12.members.keyArray().length+" **Translators** ("+rr12+"%)\r\n"+
                            role13.members.keyArray().length+" **Writers** ("+rr13+"%)\r\n"+
                            role14.members.keyArray().length+" **Youtubers/Streamers** ("+rr14+"%)\r\n"+
                            role15.members.keyArray().length+" **Game Testers** ("+rr15+"%)\r\n"+
                            role16.members.keyArray().length+" **Programmers** ("+rr16+"%)\r\n"+
                            role17.members.keyArray().length+" **Newbies** ("+rr17+"%)");
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
