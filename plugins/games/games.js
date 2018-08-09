var self = this;

self.logger = null;
self.prefix = '';
self.messager = null;

exports.init = function (context) {
    self.logger = context.logger;
    self.prefix = context.config.prefix;
    self.messager = context.messager;
}

exports.commands = [
    'coinflip',
    'roll'
]

exports['coinflip'] = {
    usage: 'Flip a coin',
    process: function (message) {
        var flip = Math.floor(Math.random() * 2) == 1 ? 'Tails' : 'Heads';
        self.messager.reply(message, `you flipped **${flip}**`, true);
    }
}

exports['roll'] = {
    usage: 'roll <n> <f> | Roll n f-sided dice, sum the result',
    process: function (message, args) {
        if (args.length != 2)
            return;

        var dice = parseInt(args[0]);
        var sides = parseInt(args[1]);

        if (isNaN(dice) || isNaN(sides))
            return;

        if (dice < 1 || sides < 1)
            return;

        var total = Math.floor(dice * (Math.random() * sides + 1));
        self.messager.reply(message, `you rolled **${dice}** ${sides}-sided dice and got **${total}**`, true);
    }
}
