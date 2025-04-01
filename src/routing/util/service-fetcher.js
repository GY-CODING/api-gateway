const ApiException = require('../../entities/api-exception.js');
const Log = require('../../logging/logger.js');

require('dotenv').config();

function buildPath(request) {
    const endpoint      = request.url.split('/').slice(2).join('/');
    const service       = "/" + request.url.split('/').slice(1)[0];

    switch(service) {
        case process.env.FALL_OF_THE_GODS_PATH:
            return `${process.env.FALL_OF_THE_GODS_URL}/${endpoint}`;
        case process.env.ACCOUNTS_PATH:
            return `${process.env.ACCOUNTS_URL}/${endpoint}`;
        case process.env.MESSAGES_PATH:
            return `${process.env.MESSAGES_URL}/${endpoint}`;
        default:
            throw new Error();
    }
}

module.exports = async function getResponse(request, userID = undefined) {
    let path = null;

    try {
        path = buildPath(request);
    } catch (error) {
        Log.error({ message: `Error building path: ${error.message}`});

        return {
            status: 500,
            body: new ApiException(
                "GATEWAY_ERROR",
                `An internal API Gateway error has occurred, sorry for the inconvenience.`,
                500
            ).toJSON()
        }
    }

    let newHeaders = new Headers();

    if(userID === undefined) {
        newHeaders = new Headers(request.headers);
    } else {
        newHeaders.append('x-user-id', userID);
        newHeaders.append('Content-Type', request.headers['content-type']);
    }

    newHeaders.append('x-api-key', process.env.SERVICE_API_KEY);

    const response = await fetch(path, {
        method: request.method,
        headers: newHeaders,
        body: request.body
    });

    // Here we should check the response and filter any non-formatted error to a SERVER_ERROR.

    return {
        status: response.status,
        body: await response.json()
    };
}