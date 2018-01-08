var rolesList = require('./roles.json');

exports.commands = [
    'role',
    'rolelist',
    'memberlist'
];

exports.init = function (client, config) {
    client.on('memberAdd', member => {
        var defaultRole = member.guild.roles
            .find('name', rolesList.find(r => r.defaultRole).name);

        if (!defaultRole)
            return;

        member.addRole(defaultRole)
            .catch(console.error);
    });
}

exports['role'] = {
    usage: 'role <role name> | Toggle the specified role',
    process: function (message) {
        var roleName = message.content
            .split(' ')
            .splice(1)
            .join(' ');

        var role = null;
        for (var i = 0, len = rolesList.length; i < len; i++) {
            var r = rolesList[i];
            if (r.name.toLowerCase() == roleName.toLowerCase()) {
                role = r;
                break;
            }
        }

        if (role == null) {
            message.reply('**' + roleName + '** is not a valid role')
                .then(m => m.delete(5000));
            return;
        } else if (!role.isAssignable) {
            message.reply('this role is off limits!')
                .then(m => m.delete(5000));
            return;
        }

        var serverRole = message.guild.roles.find("name", role.name);
        if (serverRole == null) {
            console.log('Found no role on server matching: ' + role.name);
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

        for (var i = 0; i < rolesList.length; i++) {
            var role = rolesList[i];
            if (role.isAssignable && message.guild.roles.find('name', role.name)) {
                availableRoles.push(role.name);
            }
        }

        message.reply('available roles are: ' + availableRoles.join(', '))
            .catch(console.error);
    }
}

exports['memberlist'] = {
    usage: 'List of server members by role',
    process: function (message) {
        var reply = '';

        var orderedRoles = rolesList.sort((a, b) => a.sortOrder - b.sortOrder);
        reply += 'There are currently **' + message.guild.memberCount + '** member on this server\n';

        var serverRoles = message.guild.roles
            .filter(r => r != '@everyone');

        for (var i = 0; i < orderedRoles.length; i++) {
            var role = message.guild.roles.find('name', orderedRoles[i].name);
            reply += '**' + role.name + '**: ' + role.members.keyArray().length + '\n';
        }

        message.channel.send(reply)
            .catch(console.error);
    }
}

function addRole(message, serverRole) {
    var member = message.member;

    member.addRole(serverRole)
        .catch(console.error);

    message.reply('the role **' + serverRole.name + '** has been **added**')
        .then(m => m.delete(5000));

    var defaultRole = message.guild.roles
        .find("name", rolesList.find(r => r.defaultRole).name);

    if (!defaultRole) {
        console.log('Server has no default role');
        return;
    }

    if (message.member.roles.has(defaultRole.id)) {
        removeRole(message, defaultRole);
    }
}

function removeRole(message, serverRole) {
    var member = message.member;

    member.removeRole(serverRole)
        .catch(console.error);

    message.reply('the role **' + serverRole.name + '** has been **removed**')
        .then(m => m.delete(5000));
}
