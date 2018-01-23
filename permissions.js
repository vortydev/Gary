var config = require('./config.json');

var roles = config.roles.roles;
var permissionGroups = config.permissions.permissionGroups;

exports.hasPermission = function (member, commandName, args) {
    var result = true;

    for (var i = 0; i < permissionGroups.length; i++) {
        var group = permissionGroups[i];

        for (var c = 0; c < group.commands.length; c++) {
            if (group.commands[c].includes(commandName) && args && args.length) {
                if (group.commands[c] == [commandName, args[0]].join(' ')) {
                    commandName = group.commands[c];
                    break;
                }
            }
        }

        if (!group.commands.includes(commandName))
            continue;

        result = false;

        var memberRoles = member.roles.map(r => r.name);

        for (var m = 0; m < memberRoles.length; m++) {
            for (var g = 0; g < group.roles.length; g++) {
                var role = roles.find(m => m.id == group.roles[g]);
                if (role && role.name === memberRoles[m])
                    return true;
            }
        }
    }

    return result;
}
