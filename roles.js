var roles = {};
roles.onMessage =  function (message) {

    if (message.content.toLowerCase().startsWith("*role 3d artist")) {
        let role = message.guild.roles.find("name", "3D Artist");
        let member = message.member;
        message.delete(5000);
        if (!message.member.roles.has(role.id)) {
            member.addRole(role).catch(console.error);
            message.reply("the role has been **added**.");
        }
        if (message.member.roles.has(role.id)) {
            member.removeRole(role).catch(console.error);
            message.reply("the role has been **removed**.");
        }
    }

    if (message.content.toLowerCase().startsWith("*role audio engineer")) {
        let role = message.guild.roles.find("name", "Audio Engineer");
        let member = message.member;
        message.delete(5000);
        if (!message.member.roles.has(role.id)) {
            member.addRole(role).catch(console.error);
            message.reply("the role has been **added**.");
        }
        if (message.member.roles.has(role.id)) {
        member.removeRole(role).catch(console.error);
        message.reply("the role has been **removed**.");
        }
    }

    if (message.content.toLowerCase().startsWith("*role game tester")) {
        let role = message.guild.roles.find("name", "Game Tester");
        let member = message.member;
        message.delete(5000);
        if (!message.member.roles.has(role.id)) {
            member.addRole(role).catch(console.error);
            message.reply("the role has been **added**.");
        }
        if (message.member.roles.has(role.id)) {
            member.removeRole(role).catch(console.error);
            message.reply("the role has been **removed**.");
        }
    }

    if (message.content.toLowerCase().startsWith("*role voice actor")) {
        let role = message.guild.roles.find("name", "Voice Actor");
        let member = message.member;
        message.delete(5000);
        if (!message.member.roles.has(role.id)) {
            member.addRole(role).catch(console.error);
            message.reply("the role has been **added**.");
        }
        if (message.member.roles.has(role.id)) {
            member.removeRole(role).catch(console.error);
            message.reply("the role has been **removed**.");
        }
    }

    if (message.content.toLowerCase().startsWith("*role bot")) {
        message.channel.send("**[Scanning complete]**\nHuman detected. Access denied.");
        message.delete(5000);
    }

    var roleList = [ // roles with spaces won't work
        "Animator",
        // "3D Artist",
        "Artist",
        // "Audio Engineer",
        "Composer",
        "Designer",
        // "Game Tester",
        "Marketer",
        "Programmer",
        "Translator",
        // "Voice Actor",
        "Writer",
        "Newbies"
    ];

    var deniedRoleList = [
        "Admin",
        "Mods",
        "Guru"
    ];

    message.delete(5000);
    var getRoleName = function() {
        return message.content.substr(6,1).toUpperCase() + message.content.toLowerCase().substr(7);
    }
    
    if (roleList.includes(getRoleName())) {
        let role = message.guild.roles.find("name", getRoleName());
        let member = message.member;
        
        if (role == null)
            return;
    
        if (!message.member.roles.has(role.id)) {
            member.addRole(role).catch(console.error);
            message.reply("the role has been **added**.");

            let newbies = message.guild.roles.find("name", "Newbies");
            if (newbies == null) {
                console.log('server has no Newbies role');
            } else if (message.member.roles.has(newbies.id)) {
                member.removeRole(newbies).catch(console.error);
                message.reply("the role **Newbies** has also been **removed**.");
            }
        }
        if (message.member.roles.has(role.id)) {
            member.removeRole(role).catch(console.error);
            message.reply("the role has been **removed**.");
        }
    } else if (deniedRoleList.includes(getRoleName())) {
        let role = message.guild.roles.find("name", getRoleName());
        let member = message.member;
    
        if (role == null) return;
    
        if (!message.member.roles.has(role.id)) {
            message.reply("you do not have the permission to use this command.");
        }
    
        if (message.member.roles.has(role.id)) {
            message.reply("you already have this role!");
        }
    } else {
        message.reply("that's not an available role!").then(m => m.delete(5000));
    }
}

module.exports = roles;
