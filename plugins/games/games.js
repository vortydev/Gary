exports.init = function (client, config) {}

exports.commands = [
    'coinflip',
    'roll'
]

exports['coinflip'] = {
    usage: 'Flip a coin',
    process: function (message) {
        var flip = Math.floor(Math.random() * 2 + 1 == 1) ? 'Tails' : 'Heads';
        message.channel.send('You flipped **' + flip  + '**')
            .then(m => m.delete(5000))
            .catch(console.error);
    }
}

exports['roll'] = {
    usage: 'roll <n> <f> | Roll n f-sided dice, sum the result',
    process: function (message, args) {
        var dice = parseInt(args[0]);
        var sides = parseInt(args[1]);

        if (isNaN(dice) || isNaN(sides))
            return;

        if (dice < 1 || sides < 1)
            return;

        var total = Math.floor(dice * (Math.random() * sides + 1));
        message.reply('you rolled **' + dice + '** ' + sides + '-sided dice and got **' + total + '**')
            .then(m => m.delete(5000))
            .catch(console.error);
    }
}
