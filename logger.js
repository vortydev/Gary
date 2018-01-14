exports.logCommand = function (message) {
    var name = message.member.user.username;

    log(name + ' ran command: ' + message.content);
}

exports.logStr = function (str) {
    log(str);
}

exports.logError = function (err) {
    log('ERROR: ' + err);
}

function log(message) {
    var now = new Date();
    
    var pad = function(str, size) {
        str = String(str);
        while (str.length < (size)) {
            str = '0' + str;
        }

        return str;
    };

    var dateStr = '[';
    dateStr += now.getFullYear() + '/';
    dateStr += pad((now.getMonth() + 1), 2) + '/';
    dateStr += pad(now.getDate(), 2) + ' ';
    dateStr += pad(now.getHours(), 2) + ':';
    dateStr += pad(now.getMinutes(), 2) + ':';
    dateStr += pad(now.getSeconds(), 2) + ']\t';

    console.log(dateStr + message);
}
