var fs = require('fs'),
    path = require('path');

var pluginDirectory = './plugins/';
var pluginFolders;

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath)
        .filter(f => {
            return fs.statSync(path.join(srcPath, f))
                .isDirectory(); 
        });
}

if (!fs.existsSync(pluginDirectory)) {
    console.log('no plugins directory available');
} else {
    pluginFolders = getDirectories(pluginDirectory);
}

function loadPlugins(bot, client, config) {
    for (var i = 0; i < pluginFolders.length; i++) {
        var plugin;
        try {
            plugin = require(pluginDirectory + pluginFolders[i]);
        } catch (err) {
            console.log(pluginFolders[i] + ' failed to load: ' + err);
        }
        
        if (plugin) {
            plugin.init(client, config);
            console.log(pluginFolders[i] + ' loaded');
        }
    }
}

exports.init = loadPlugins;
