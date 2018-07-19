var self = this;

var Discord = require('discord.js'),
    subrole = require('./subrole.js');

self.config = null;
self.fullconfig = null;

exports.commands = [
    'verify',
    'role',
    'rolelist',
    'subrole'
];

self.logger = null;

exports.init = function (context) {
    self.config = context.config.roles;
    self.fullconfig = context.config;
    self.logger = context.logger;

    var client = context.client;

    client.on('guildMemberAdd', addDefaultRoles);

    client.on('message', message => {
        if (!self.config.enforceDefaultRoles || !message.guild)
            return;

        enforceDefaultRoles(message.member);
    });

    subrole.init(context);
}
exports['verify'] = {
    usage: 'Verifies the user.',
    process: function(message, args, config) {
        var role = message.guild.roles.find("name", self.config.verifiedRole);

        if (!message.member.roles.has(role.id)) {
            message.member.addRole(role).catch(console.error);
            message.channel.send(message.member +" was verified. ✅").then(m => m.delete(5000));
        }

        else return;
    }
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
            if (self.config.mutuallyExclusiveRoles) {

                for (var i = 0; i < self.config.assignableRoles.length; i++) {
                    for (var j = 0; j < self.config.roles.length; j++) {
                        var otherServerRole = message.guild.roles.find("name", self.config.roles[i].name);
                        if (message.member.roles.has(otherServerRole.id) && otherServerRole != serverRole) {
                            message.reply("you already have a role!")
                                .then(m => m.delete(5000));
                            return;
                        }
                    }
                }
            }
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
            .setTitle("Available Roles")
            .setDescription(availableRoles.join('\n'))
            .setFooter(new Date())
            .setAuthor(message.author.tag, message.author.avatarURL);

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
            if (self.config.enforceDefaultRoles) {
                enforceDefaultRoles(member);
            }
            message.reply('the role **' + serverRole.name + '** has been **removed**')
                .then(m => m.delete(5000))
                .catch(e => self.logger.error(e, 'role rm'));
       }).catch(e => self.logger.error(e, 'role rm'));

    var subRoles = subrole.getSubRoles(serverRole.name).map(r => r.name);
    var rolesToRemove = [];
    for (var i = 0; i < subRoles.length; i++) {
        var subRoleName = subRoles[i];

        var subRole = member.roles.find('name', subRoles[i]);
        if (!subRole)
            continue;

        rolesToRemove.push(subRole);
    }

    if (!rolesToRemove.length)
        return;

    member.removeRoles(rolesToRemove)
        .then(() => {
            if (self.config.enforceDefaultRoles) {
                enforceDefaultRoles(member);
            }

            self.logger.log('Removed subroles:' + rolesToRemove.map(r => r.name).join(', '), 'role rm');
            message.reply('removed subroles:\n**' + rolesToRemove.map(r => r.name).join('**\n**') + '**')
                .then(m => m.delete(5000))
                .catch(e => self.logger.error(e, 'role rm'));

        }).catch(e => self.logger.error(e, 'role rm'));
}

function enforceDefaultRoles(member) {
    var remainingRoles = member.roles
        .array()
        .filter(r => r.name != '@everyone');

    if (remainingRoles.length == 0) {
        addDefaultRoles(member);
    }
}
