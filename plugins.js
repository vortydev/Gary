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
    console.log(pluginFolders);
}


function loadPlugins(client, config) {
    require('./members/members.js').init(client, config);
    require('./roles/roles.js').init(client, config);
}

exports.init = loadPlugins;
