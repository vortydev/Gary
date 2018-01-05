# Gary, the most awesome Discord bot, by TheV0rtex
I'm proud to offer you guys my now open-sourced Discord bot, Gary! :D - TheV0rtex

# Setting it up:

1. Rename `config.json.example` to `config.json` and fill in the details.
2. Run `$ node Gary.js`

# Roles:

Rename `roles.json.example` to `roles.json`. Add roles (case-sensitively!) to the file. Set `isAssignable` to `true` if you want your users to be able to assign themselves the role using the `role` command.

# Permissions:

Rename `permissiongroups.json.example` to `permissiongroups.json`. By default a command is available to everyone. To limit the availability of a command, create a new group. Only the roles listed in the `roles` section of the group will be able to use a command listed in `commands`.

# Available commands:

Available commands can be listed with the `help` command.

*Note: some commands you may see on the server TairaGames Dev Squad are hard-coded and are not included in this repo.*
