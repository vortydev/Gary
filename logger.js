var fs = require('fs'),
    path = require('path');

const sourceLength = 12;

var currentLog = null;

exports.logCommand = function (message) {
    var name = message.author.username;

    logMessage(name + ' ran command: ' + message.content);
}

exports.log = function (str, source) {
    logMessage(str, source);
}

exports.error = function (err, source) {

    if (err.stack == null || getErrorLocation(err) == null) {
        logMessage('ERROR: ' + err, source);
        return;
    }

    logMessage('Error at ' + getErrorLocation(err) + ' - ' + err, source);
    if (err.stack) {
        logMessage('Stack trace: ' + err.stack);
    } else {
        logMessage('Stack trace not available');
    }
}

function getErrorLocation(err) {
    var regex = /\(.*\)/;
    var a = err.stack.match(regex);
    if (a == null)
        return null;
    return a[0];
}

function createNewLog() {

    if (currentLog != null) {
        logMessage("Attempted to create new log when one already existed for the current session.");
        return;
    }

    var padNum = (str, size) => padStart(str, '0', size);
    var now = new Date();

    var date = "";
    date += now.getUTCFullYear();
    date += padNum((now.getUTCMonth() + 1), 2);
    date += padNum(now.getUTCDate(), 2);
    date += padNum(now.getUTCHours(), 2);
    date += padNum(now.getUTCMinutes(), 2);
    date += padNum(now.getUTCSeconds(), 2);
   
    var logsPath = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsPath)) {
        fs.mkdirSync(logsPath);
    }
    currentLog = fs.createWriteStream(path.join(logsPath, date + ".txt"));
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
    dateStr += now.getUTCFullYear() + '/';
    dateStr += padNum((now.getUTCMonth() + 1), 2) + '/';
    dateStr += padNum(now.getUTCDate(), 2) + ' ';
    dateStr += padNum(now.getUTCHours(), 2) + ':';
    dateStr += padNum(now.getUTCMinutes(), 2) + ':';
    dateStr += padNum(now.getUTCSeconds(), 2) + ']\t';

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
