var config = require('./config.json');

var roles = config.roles.roles;
var permissionGroups = config.permissions.permissionGroups;

exports.hasPermission = function (member, commandName) {
    var result = true;

    for (var i = 0; i < permissionGroups.length; i++) {
        var group = permissionGroups[i];

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
