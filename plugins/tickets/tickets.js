var self = this;

var fs = require("fs");
var Discord = require("discord.js");

const ticketsPath = './plugins/tickets/tickets.json';

let tickets = JSON.parse(fs.readFileSync(ticketsPath, "utf8")); // ticket system

self.config = null;
self.logger = null;

exports.commands = [
    'ticket new',
    'ticket close',
    'ticket count'
];

exports.init = function (client, config, _, logger) {
    self.config = config;
    self.logger = logger;
}

exports['ticket new'] = {
    usage: 'Opens up a new ticket.',
    process: function (message, args) {
        if (!message.guild.roles.exists("name", "perms")) { // If role not found
            message.reply("this server doesn't have a \`perms` role, so the ticket won't be opened.\n"+
                          "If you are an administrator, make a role with that name exactly and give it to users that will answer the tickets.");
            return;
        }

        if (!tickets[client.user.id]) tickets[client.user.id] = {tickets:0}; // sets values to 0

        let ticketData = tickets[client.user.id];
        if (ticketData.tickets < 10000) {
        ticketData.tickets++; // adds 1 to the ticket count
        };

        fs.writeFile(ticketsPath, JSON.stringify(tickets), (err) => {
            if (err) console.error(err)
        });

        message.guild.createChannel("ticket-"+ticketData.tickets, "text").then(chnl => {
            let support = message.guild.roles.find("name", "perms");
            let everyone = message.guild.roles.find("name", "@everyone");
            chnl.overwritePermissions(message.author, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            chnl.overwritePermissions(support, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true,
                MANAGE_MESSAGES: true
            });
            chnl.overwritePermissions(everyone, {
                SEND_MESSAGES: false,
                READ_MESSAGES: false
            });

            message.reply("your ticket has been created: `"+chnl.name+"`.");
            chnl.send(message.author+", please explain the reason for this ticket with as much precision and details as you can. Our **"+support.name+"** will be here to help you as soon as possible.");

        }).catch(console.error);

        return;
    }
}

exports['ticket close'] = {
    usage: 'Closes a ticket that has been resolved or been opened by accident.',
    process: function (message, args) {
        if (!message.guild.roles.exists("name", "Support Team")) { // If role not found
            message.reply("this server doesn't have a \`Support Team\` role made, so the ticket won't be opened.\n"+
                          "If you are an administrator, make a role with that name exactly and give it to users that will answer the tickets.");
            return;
        }

        if (!message.channel.name.startsWith("ticket-")) {
            message.reply("you can't use the close command outside of a ticket channel.");
            return;
        }

        message.channel.send("Are you sure? Once confirmed, you cannot reverse this action!\n"+
                              "To confirm, please type \`"+config.prefix+"confirm\`. This will cancel in 20 seconds.")
        .then((msg) => {
            message.channel.awaitMessages(response => response.content === config.prefix+"confirm", { // $confirm
                max: 1,
                time: 20000, // wait 20 secounds
                errors: ["time"],
            })
            .then((collected) => {
                message.channel.delete();
            })
            .catch(() => {
                msg.edit("Ticket close timed out, the ticket was not closed.").then(msg2 => {
                    msg2.delete(5000);
                }, 3000);
            });
        });

        return;
    }
}

exports['ticket count'] = {
    usage: 'Sends the user the number of opened tickets.',
    process: function (message, args) {
        if (!message.guild.roles.exists("name", "Support Team")) { // If role not found
            message.reply("this server doesn't have a \`Support Team\` role made, so the ticket won't be opened.\n"+
                          "If you are an administrator, make a role with that name exactly and give it to users that will answer the tickets.");
            return;
        }
        if (!tickets[client.user.id]) tickets[client.user.id] = {tickets:0}; // sets values to 0

        let ticketData = tickets[client.user.id];

        fs.writeFile(ticketsPath, JSON.stringify(tickets), (err) => {
            if (err) console.error(err)
        });

        message.reply(ticketData.tickets+" have been opened.")
    }

}
