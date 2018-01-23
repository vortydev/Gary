# Gary, the most awesome Discord bot, by TheV0rtex
I'm proud to offer you guys my now open-sourced Discord bot, Gary! :D - TheV0rtex

# Setting it up:

1. Rename `config.json.example` to `config.json` and fill in the details.
2. Run `$ node gary.js`

# Roles:

There are two flavours of roles, **groups** and **subroles**. 

**Group roles** are configured in the `roles.roles` section of `config.json`. A group role requires a unique ID and a name matching a configured role on the server. `assignableRoles` is a list of the IDs that can be assigned using the `role` command. `defaultRoles` are the IDs of the group roles a user is automatically assigned on joining the server.

**Subroles** are managed via the `subrole` command. Subroles can be created and deleted with `subrole new` and `subrole delete`. Once added, a `subrole` can be assigned to one or many parents with `subrole add`, or removed with `subrole remove`. Lastly, availably subroles can be shown with `subrole list` and `subrole list <group name>`.

# Permissions:

By default a command is available to everyone. To limit the availability of a command, create a new group in `config.json` under `permissions.permissiongroups`. Only the role IDs listed in the `roles` section of the group will be able to use a command listed in `commands`.

# Links:

Rename `links.json.example` to `links.json`. Available links can be listed be calling the `links` command without parameters.

# Quiz

Rename `quizconfig.json.example` to `quizconfig.json`. Add `timeToAnswer` and `timeToJoin` to the file (in seconds). Optionally, add a channel (for example, `bot-spam`) to `channel` to lock the quiz to one channel.

# Message Filter

To filter messages, use the `messagefilter` section of `config.json`. The one with `*` as the channel name is all channels that are not specified. If another item does not have, for example, `blacklist`, the blacklist will be the `*` channel's.

The filter uses [Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions).

# Available commands:

Available commands can be listed with the `help` command.

The order in which plugins and commands appear in the help command can be configured with `pluginorder.json.example`. Rename it to `pluginorder.json` and create an entry for each plugin, specifying the desired sort order. The order of commands under a plugin heading is configured by the order of the commands in the plugin's `.commands` member.
