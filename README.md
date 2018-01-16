# Gary, the most awesome Discord bot, by TheV0rtex
I'm proud to offer you guys my now open-sourced Discord bot, Gary! :D - TheV0rtex

# Setting it up:

1. Rename `config.json.example` to `config.json` and fill in the details.
2. Run `$ node Gary.js`

# Roles:

Rename `roles.json.example` to `roles.json`. Add roles (case-sensitively!) to the file. Set `isAssignable` to `true` if you want your users to be able to assign themselves the role using the `role` command. Use `sortOrder` to specify the order in which `memberlist` displays roles, starting from 0.

# Permissions:

Rename `permissiongroups.json.example` to `permissiongroups.json`. By default a command is available to everyone. To limit the availability of a command, create a new group. Only the roles listed in the `roles` section of the group will be able to use a command listed in `commands`.

# Links:

Rename `links.json.example` to `links.json`. Available links can be listed be calling the `links` command without parameters.

# Quiz

To lock the quiz to a single channel (for example, `bot-spam`) edit the `channel` value of `quizconfig.json` which is in `/plugins/quiz`.

# Message Filter

To filter messages, rename `messagefilter.json.example` to `messagefilter.json`. The one with `*` as the channel name is all channels that are not specified. It must be the first item. If another item does not have, for example, `blacklist`, the blacklist will be the `*` channel's.

If using the RegEx option, make sure to include the flags.

# Available commands:

Available commands can be listed with the `help` command. 

The order in which plugins and commands appear in the help command can be configured with `pluginorder.json.example`. Rename it to `pluginorder.json` and create an entry for each plugin, specifying the desired sort order. The order of commands under a plugin heading is configured by the order of the commands in the plugin's `.commands` member.
