var fs = require('fs');

const sourceLength = 12;

var currentLog = null;

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

function createNewLog() {
    
    if (currentLog != null) {
        logMessage("Attempted to create new log when one already existed for the current session.");
        return;
    }

    var padNum = (str, size) => padStart(str, '0', size);
    var now = new Date();

    var date = "";
    date += now.getFullYear();
    date += padNum((now.getMonth() + 1), 2);
    date += padNum(now.getDate(), 2);
    date += padNum(now.getHours(), 2);
    date += padNum(now.getMinutes(), 2);
    date += padNum(now.getSeconds(), 2);

    currentLog = fs.createWriteStream("logs/" + date + ".txt");
}

function addToLog(addition) {
    if (currentLog == null) {
        logMessage("Attempted to add to a log when one didn't exist.");
        return;
    }

    currentLog.write(addition + "\r\n");
}

function logMessage(message, source) {
    
    if (currentLog == null)
        createNewLog()

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

    addToLog(dateStr + source + message);
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
