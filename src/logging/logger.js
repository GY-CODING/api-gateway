const LogLevel = require('../entities/log-levels.js');
require('dotenv').config();

module.exports = class Log {
    static info(data) {
        console.info("[INFO] " + data.message);
        log(LogLevel.INFO, data);
    }

    static error(data) {
        console.error("[ERROR] " + data.message);
        log(LogLevel.ERROR, data);
    }

    static warn(data) {
        console.warn("[WARN] " + data.message);
        log(LogLevel.WARN, data);
    }

    static debug(data) {
        console.debug("[DEBUG] " + data.message);
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