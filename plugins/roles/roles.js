var self = this;

self.config = null;

exports.commands = [
    'role',
    'rolelist',
    'memberlist'
];

self.logger = null;

exports.init = function (client, config, _, logger) {
    self.config = config.roles;
    self.logger = logger;
    
    client.on('guildMemberAdd', member => {
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
    });
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

        

        if (role == null) {
            message.reply('**' + args.join(' ') + '** is not a valid role')
                .then(m => m.delete(5000));
            return;
        }  
        
        if (!self.config.assignableRoles.includes(role.id)) {
            message.reply('this role is off limits!')
                .then(m => m.delete(5000));
            return;
        }
        
        var serverRole = message.guild.roles.find("name", role.name);
        if (serverRole == null) {
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

        for (var i = 0; i < self.config.roles.length; i++) {
            var role = self.config.roles[i];
            if (role.isAssignable && message.guild.roles.find('name', role.name)) {
                availableRoles.push(role.name);
            }
        }

        message.reply('available roles are: ' + availableRoles.join(', '))
            .catch(self.logger.error);
    }
}

exports['memberlist'] = {
    usage: 'List of server members by role',
    process: function (message) {
        var reply = '';

        message.channel.send("Generating memberlist...")
            .then(m => m.delete(2000))
            .catch(self.logger.error);
        
        var orderedRoles = self.config.roles.sort((a, b) => a.sortOrder - b.sortOrder);
        reply += 'There are currently **' + message.guild.memberCount + '** member on this server\n';

        var serverRoles = message.guild.roles
            .filter(r => r != '@everyone');

        for (var i = 0; i < orderedRoles.length; i++) {
            var role = message.guild.roles.find('name', orderedRoles[i].name);
            if (!role) {
                self.logger.log('could not find role on server: ' + orderedRoles[i].name);
                continue;
            }
            reply += '**' + role.name + '**: ' + role.members.keyArray().length + '\n';
        }

        message.channel.send(reply)
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
            removeRole(message, defeultServerRole);
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
