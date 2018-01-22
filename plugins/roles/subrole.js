var self = this;

var fs = require('fs');

const rolesPath = './plugins/roles/_roles.json';
const subRoleUsage = '`subrole new <role>` | create a new subrole\n'
    + '`subrole list <group>` | list subroles in a group\n'
    + '`subrole add <group>:<role>` | add a subrole to a group\n'
    + '`subrole remove <group>:<role>` | remove a subrole from a group';

self.logger = null;
self.config;
self.subRolesData = null;
self.commands = [
    { name: 'new', process: subRoleNew },
    { name: 'delete', process: subRoleDelete },
    { name: 'list', process: subRoleList },
    { name: 'add', process: subRoleAdd },
    { name: 'remove', process: subRoleRemove }
];

exports.usage = subRoleUsage;

exports.init = function(config, logger) {
    self.config = config.roles;
    self.logger = logger;

    if (!fs.existsSync(rolesPath)) {
        self.logger.log('found no subroles data, creating...', 'subrole');
        createRolesFile();
    }
}

exports.process = function(message, args) {
    if (args.length == 0) {
        subRoleHelp(message.member);
        return;
    }

    var command = self.commands
        .find(c => c.name == args[0]);

    if (!command) {
        subRoleHelp(message.member);
        return;
    }

    command.process(message, args.slice(1).join(' '));
}

function subRoleHelp(member) {
    member.send(subRoleUsage)
        .catch(e => self.logger.error(e, 'subrole'));
}

function subRoleNew(message, argStr) {
    modifyData(d => {
        var id = 0;

        if (d.groups.find(g => g.name.toLowerCase() == argStr.toLowerCase())) {
            self.logger.error('unable to create subrole: group name collision', 'sr new');    
            return;
        }

        if (d.subRoles.find(sr => sr.name.toLowerCase() == argStr.toLowerCase())) {
            self.logger.error('unable to create subrole: already exists', 'sr new');    
            return;
        }

        if (d.subRoles.length) {
            var ids = d.subRoles.map(sr => sr.id);
            id = Math.max(...ids) + 1;
        }

        var subRole = {
            id: id,
            name: argStr
        };

        message.guild.createRole({ name: argStr })
            .then(r => self.logger.log('created role ' + argStr + ' on server', 'sr new'))
            .catch(e => self.logger.error(e, 'sr new'));

        d.subRoles.push(subRole);
    });
}

function subRoleDelete(message, argStr) {
    modifyData(d => {
        var subRole = d.subRoles.find(sr => sr.name.toLowerCase() == argStr.toLowerCase());
        if (!subRole) {
            self.logger.log('no role matching: ' + argStr, 'sr del');
            return;
        }
        
        d.subRoles.splice(d.subRoles.indexOf(subRole), 1);

        var groups = d.groups.filter(g => {
            return g.subRoleIds.includes(subRole.id);
        });

        for(var i = 0; i < groups.length; i++) {
            self.logger.log(`removing ${subRole.name} from ${groups[i].name}`, 'sr del');
            groups[i].subRoleIds.pop(subRole.id);
        }

        self.logger.log('deleted subrole: ' + subRole.name, 'sr del');
    });
}

function subRoleList(message, argStr) {
    var reply = '\n';

    readData(d => {
        var outputGroup = g => {
            var subRoles = g.subRoleIds.map(id => {
                return d.subRoles.find(sr => sr.id == id);
            });    

            return subRoles.length ? 
                `The subroles for **${g.name}** are:\n` +
                '`' + subRoles
                .map(sr => sr.name)
                .join('`\n`') + '`\n' :
                `No roles for group **${g.name}**\n`;
        };

        if (!argStr) {
            reply = d.subRoles.length ? 
                'subroles:\n`' + d.subRoles
                .map(sr => sr.name)
                .join('`\n`') + '`\n' : 
                'no subroles available';

        } else {
            var group = d.groups.find(g => {
                return g.name.toLowerCase() == argStr.toLowerCase();
            });

            reply = group ?
                outputGroup(group) :
                `no group matching **${argStr}**`;
        }
        message.reply(reply)
            .catch(e => self.logger.error(e, 'sr list'));
    });
}

function subRoleAdd(message, argStr) {
    var splitChar = ':';
    if (!argStr.includes(splitChar)) {
        subRoleHelp(message.member);
        return;
    }

    var args = argStr.split(splitChar);
    modifyData(d => {
        var group = d.groups.find(g => {
            return g.name.toLowerCase() == args[0].toLowerCase();        
        });

        if (!group) {
            message.reply('no group matching ' + args[0])
                .catch(e => self.logger.error(e, 'sr add'));

            return;
        }

        var role = d.subRoles.find(sr => {
            return sr.name.toLowerCase() == args[1].toLowerCase();
        });

        if (!role) {
            message.reply('no role matching ' + args[1])
                .catch(e => self.logger.error(e, 'sr add'));

            return;
        }

        if (group.subRoleIds.includes(role.id)) {
            message.reply(`**${role.name}** is already a subrole of **${group.name}**`)
                .catch(e => self.logger.error(e, 'sr add'));+ group.name

            return;
        }

        group.subRoleIds.push(role.id);
    });
}

function subRoleRemove(message, argStr) {
    var splitChar = ':';
    if (!argStr.includes(splitChar)) {
        subRoleHelp(message.member);
    }

    var args = argStr.split(splitChar);
    modifyData(d => {
        var group = d.groups.find(g => {
            return g.name.toLowerCase() == args[0].toLowerCase();        
        });

        if (!group) {
            message.reply('no group matching ' + args[0])
                .catch(e => self.logger.error(e, 'sr remove'));

            return;
        }

        var role = d.subRoles.find(sr => {
            return sr.name.toLowerCase() == args[1].toLowerCase();
        });

        if (!role) {
            message.reply('no role matching ' + args[1])
                .catch(e => self.logger.error(e, 'sr remove'));

            return;
        }

        if (!group.subRoleIds.includes(role.id)) {
            message.reply(`**${role.name}** is not a subrole of **${group.name}**`)
                .catch(e => self.logger.error(e, 'sr remove'));+ group.name

            return;
        }

        group.subRoleIds.splice(group.subRoleIds.indexOf(role.id), 1);
    });
}

function createRolesFile() {
    var data = {
        groups: self.config.roles.map(r => {
            return {
                id: r.id,
                name: r.name,
                subRoleIds: []
            };
        }),
        subRoles: []
    };

    fs.writeFile(rolesPath, JSON.stringify(data), 'utf8', e => {
        if (e) {
            self.logger.error(e, 'subrole');
            return;
        }    

        self.logger.log('created subrole data file', 'subrole');
    });
}

function readData(read) {
    fs.readFile(rolesPath, 'utf8', (e, data) => {
        if (e) {
            self.logger.error(e, 'sr read');
            return;
        }

        read(JSON.parse(data));
    });
}

function modifyData(modify) {
    readData(o => {
        modify(o);

        fs.writeFile(rolesPath, JSON.stringify(o), 'utf8', e => {
            if (e) {
                self.logger.error(e, 'sr write');
                return;
            }

            self.logger.log('saved subrole data', 'sr mod');
        });
    });
}
