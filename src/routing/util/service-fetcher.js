const ApiException = require('../../entities/api-exception.js');
const Log = require('../../logging/logger.js');

require('dotenv').config();

function buildPath(request) {
    const endpoint      = request.url.split('/').slice(2).join('/');
    const service       = "/" + request.url.split('/').slice(1)[0];

    switch(service) {
        case process.env.HERALDS_OF_CHAOS_PATH:
            return `${process.env.HERALDS_OF_CHAOS_URL}/${endpoint}`;
        case process.env.ACCOUNTS_PATH:
            return `${process.env.ACCOUNTS_URL}/${endpoint}`;
        case process.env.MESSAGES_PATH:
            return `${process.env.MESSAGES_URL}/${endpoint}`;
        case process.env.BOOKS_PATH:
            return `${process.env.BOOKS_URL}/${endpoint}`;
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
            ).toJSON(),
            contentType: 'application/json'
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

    let response;

    try {
        response = await fetch(path, {
            method: request.method,
            headers: newHeaders,
            body: JSON.stringify(request.body)
        });
    } catch (error) {
        Log.error({ message: "An error with the authentication service has occurred: " + newHeaders.entries() });
        throw new Error("500");
    }

    // Here we should check the response and filter any non-formatted error to a SERVER_ERROR.
    
    let responseBody;
    let responseContentType = response.headers.get('content-type');
    let contentType = response.headers.get('content-type');

    if(!contentType) contentType = "text/plain";

    if (contentType.includes('application/json')) {
        responseBody = await response.json();
    } else if (contentType.includes('image/png') || contentType.includes('image/jpeg')) {
        responseBody = Buffer.from(await response.arrayBuffer());
    } else {
        responseBody = await response.text();
    }

    return {
        status: response.status,
        body: responseBody,
        contentType: responseContentType
    };
}