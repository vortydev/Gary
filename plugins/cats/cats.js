var self = this;

var request = require('request');
var Discord = require('discord.js');
var catsconfig = require('./catsconfig.json');

self.client = null;
self.config = null;
self.logger = null;
self.messager = null;

exports.init = function (context) {
    self.client = context.client;
    self.config = context.config;
    self.logger = context.logger;
    self.messager = context.messager;

    if (catsconfig.postToChannelID == '' || !catsconfig.postEvery) {
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

    request(
        {
            url: caturl,
            json: false
        }, 
        function (error, response, body) {

            var cat = null;
            try {
                cat = JSON.parse(body);
            } catch (e) {
                self.logger.log(e, 'cats');
                return;
            }
            
            var embed = new Discord.RichEmbed()
                .setColor(self.config.embedCol)
                .setTitle('A random cat')
                .setDescription('Next cat in ' + catsconfig.postEvery + ' seconds')
                .setImage(cat.file)
                .setTimestamp();
            
            self.messager.send(channel, { embed }, false);
        }
    );
}
