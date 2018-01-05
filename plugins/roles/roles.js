var rolesList = require('./roles.json');

exports.commands = [
    'role'
];

exports.init = function (client, config) { }

exports['role'] = {
    usage: 'role <role name> | toggle the specified role',
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

function addRole(message, serverRole) {
    var member = message.member;

    member.addRole(serverRole)
        .catch(console.error);

    message.reply('the role **' + serverRole.name + '** has been **added**')
        .then(m => m.delete(5000));

    var newbRole = message.guild.roles.find("name", "Newcomer");
    if (newbRole == null) {
        console.log('Server has no Newcomer role');
        return;
    }

    if (message.member.roles.has(newbRole.id)) {
        removeRole(message, newbRole);
    }
}

function removeRole(message, serverRole) {
    var member = message.member;

    member.removeRole(serverRole)
        .catch(console.error);

    message.reply('the role **' + serverRole.name + '** has been **removed**')
        .then(m => m.delete(5000));
}
