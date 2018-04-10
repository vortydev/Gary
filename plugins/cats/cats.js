var self = this;

var request = require('request');
var Discord = require('discord.js');
var catsconfig = require('./catsconfig.json');

self.client = null;
self.config = null;
self.logger = null;

exports.init = function (client, config, package, logger, permissions) {
    self.client = client;
    self.config = config;
    self.logger = logger;

    if (postToChannelID == '' || !postEvery) {
        self.logger.log('catsconfig.json needs to be filled in for the cats module to work.', 'cats');
        return;
    }

    setInterval(sendCat, catsconfig.postEvery * 1000);
}

function sendCat() {
    var channel = self.client.channels.get(catsconfig.postToChannelID);

    if (channel == null) {
        self.logger.log('Failed to find a channel with the id \'' + catsconfig.postToChannelID + '\'', 'cats');
        return;
    }

    var caturl = 'http://aws.random.cat/meow.php';

    request({
        url: caturl,
        json: false
        }, function (error, response, body) {
            cat = JSON.parse(body);
            if (error) {
                self.logger.log(cat.error, 'cats');
                return;
            }
            var embed = new Discord.RichEmbed()
                .setColor(self.config.embedCol)
                .setTitle('A random cat')
                .setDescription('Next cat in ' + catsconfig.postEvery + ' seconds')
                .setImage(cat.file)
                .setTimestamp();
            channel.send({embed})
              .catch(self.logger.error);
        }
    );
}
