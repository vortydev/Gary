var self = this;

var Discord = require('discord.js'),
    subrole = require('./subrole.js');

self.config = null;
self.fullconfig = null;

exports.commands = [
    'role',
    'rolelist',
    'subrole'
];

self.logger = null;

exports.init = function (client, config, _, logger) {
    self.config = config.roles;
    self.fullconfig = config;
    self.logger = logger;

    client.on('guildMemberAdd', addDefaultRoles);

    subrole.init(config, logger);
}

exports['role'] = {
    usage: 'role <role name> | Toggle the specified role',
    process: function (message, args) {
        var role = null;
        for (var i = 0, len = self.config.roles.length; i < len; i++) {
            var r = self.config.roles[i];
            if (r.name.toLowerCase().replace(' ', '') == args.join('').toLowerCase()) {
                role = r;
                break;
            }
        }

        if (role) {
            if (!self.config.assignableRoles.includes(role.id)) {
                message.reply('this role is off limits!')
                    .then(m => m.delete(5000));
                return;
            }
        } else {
            // role wasn't in configured roles, it could be a subrole
            role = subrole.getSubRole(args.join(' '));
            if (!role) {
                message.reply('**' + args.join(' ') + '** is not a valid role')
                    .then(m => m.delete(5000));
                return;
            }

            if (!subrole.canUse(message.member, role)) {
                message.reply('you do not have the right group role for: **' + role.name + '**')
                    .then(m => m.delete(5000))
                    .catch(e => self.logger.error(e, 'role'));
                return;
            }
        }
        
        var serverRole = message.guild.roles.find("name", role.name);
        if (!serverRole) {
            self.logger.log('Found no role on server matching: ' + role.name);
            return;
        }
        
        if (!message.member.roles.has(serverRole.id)) {
            addRole(message, serverRole);
        } else {
            removeRole(message, serverRole);
        }
    }
}

exports['rolelist'] = {
    usage: 'List assignable roles',
    process: function (message) {
        var availableRoles = [];

        for (var i = 0; i < self.config.assignableRoles.length; i++) {
            for (var x = 0; x < self.config.roles.length; x++) {
                if (self.config.roles[x].id == self.config.assignableRoles[i]) {
                    availableRoles.push(self.config.roles[x].name)
                }
            }
        }

        if (availableRoles.length == 0) {
            message.reply("there are no availible roles!")
                .then(m => m.delete(5000))
                .catch(self.logger.error);
            return;
        }

        var embed = new Discord.RichEmbed()
            .setColor(parseInt(self.fullconfig.embedCol, 16))
            .setTitle("Availible Roles")
            .setDescription(availableRoles.join('\n'))
            .setFooter(new Date());

        message.channel.send({ embed })
            .catch(self.logger.error);
    }
}

exports['subrole'] = {
    usage: subrole.usage,
    process: subrole.process
}

function addDefaultRoles(member) {
    for (var i = 0; i < self.config.defaultRoles.length; i++) {
        var roleId = self.config.defaultRoles[i];
        var role = self.config.roles.find(r => r.id == roleId);
        if (!role) {
            self.logger.log(`No role with ID: ${roleId}`, 'roles');
            continue;
        }

        var serverRole = member.guild.roles.find('name', role.name);
        if (!serverRole) {
            self.logger.log(`No role on server with name: ${role.name}`, 'roles');
            continue;
        }

        member.addRole(serverRole)
            .catch(self.logger.error);
    }
}

function addRole(message, serverRole) {
    var member = message.member;

    member.addRole(serverRole)
        .then(() => {
            self.logger.log('Added role ' + serverRole.name + ' to ' + member.user.username);
        })
        .catch(self.logger.error);

    message.reply('the role **' + serverRole.name + '** has been **added**')
        .then(m => m.delete(5000));

    if (!self.config.defaultRoles.length) 
        return;

    var defaultRoles = self.config.roles.filter(r => {
        return self.config.defaultRoles.includes(r.id);
    });

    for (i = 0; i < defaultRoles.length; i++) {
        var role = defaultRoles[i];
        var defaultServerRole = message.guild.roles.find('name', role.name);
        if (!defaultServerRole) {
            self.logger.log(`No role on server: ${role.name}`, 'roles');
            continue;
        }

        if (message.member.roles.has(defaultServerRole.id)) {
            removeRole(message, defaultServerRole);
        }
    }
}

function removeRole(message, serverRole) {
    var member = message.member;

    member.removeRole(serverRole)
        .then(() => {
            self.logger.log('Removed role ' + serverRole.name + ' from ' + member.user.username);
        })
        .catch(self.logger.error);
    
    message.reply('the role **' + serverRole.name + '** has been **removed**')
        .then(m => m.delete(5000));
}
