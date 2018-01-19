const sourceLength = 12;

exports.logCommand = function (message) {
    var name = message.member.displayName;

    logMessage(name + ' ran command: ' + message.content);
}

exports.log = function (str, source) {
    logMessage(str, source);
}

exports.error = function (err, source) {
    logMessage('ERROR: ' + err, source);
}

function getErrorSource(err) {
    var regex = /\(.*\)/;
    var a = err.stack.match(regex);
    regex = /\.js:.*:.*\)/
    var b = a[0].substring(__dirname.length + 2).replace(regex, '');
    return b;

    //For example, it might return 'logger'
}

function logMessage(message, source) {
    var now = new Date();
    var padNum = (str, size) => padStart(str, '0', size);
    
    if (!source) {
        source = '';
    }

    while (source.length <= sourceLength) {
        source += ' ';
    }
    var dateStr = '[';
    dateStr += now.getFullYear() + '/';
    dateStr += padNum((now.getMonth() + 1), 2) + '/';
    dateStr += padNum(now.getDate(), 2) + ' ';
    dateStr += padNum(now.getHours(), 2) + ':';
    dateStr += padNum(now.getMinutes(), 2) + ':';
    dateStr += padNum(now.getSeconds(), 2) + ']\t';

    console.log(dateStr + source + message);
}

function padStart(str, padChar, targetLength) {
    str = String(str);
    while (str.length < targetLength) {
        str = padChar + str;
    }

    return str;
}

function padEnd(str, padChar, targetLength) {
    str = String(str);
    while (str.length < targetLength) {
        str += padChar;
    }

    return str;
}
