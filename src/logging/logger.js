const LogLevel = require('../entities/log-levels.js');
require('dotenv').config();

module.exports = class Log {
    static info(data) {
        log(LogLevel.INFO, data);
    }

    static error(data) {
        log(LogLevel.ERROR, data);
    }

    static warn(data) {
        log(LogLevel.WARN, data);
    }

    static debug(data) {
        log(LogLevel.DEBUG, data);
    }
}

function log(level, data) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", process.env.LOGS_AUTH_TOKEN);

    var raw = JSON.stringify({
        "level": level,
        "data": data,
        "message": data.message
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch(process.env.LOGS_URL, requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}