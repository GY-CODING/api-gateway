const ApiException = require('../../entities/api-exception.js');

function buildPath(request, env) {
    const endpoint      = request.url.split('/').slice(4).join('/');
    const service       = "/" + request.url.split('/').slice(3)[0];

    switch(service) {
        case env.FALL_OF_THE_GODS_PATH:
            return `${env.FALL_OF_THE_GODS_URL}/${endpoint}`;
        case env.ACCOUNTS_PATH:
            return `${env.ACCOUNTS_URL}/${endpoint}`;
        case env.MESSAGES_PATH:
            return `${env.MESSAGES_URL}/${endpoint}`;
        default:
            throw new Error();
    }
}

module.exports = async function getResponse(request, env, userID = undefined) {
    let path = null;

    try {
        path = buildPath(request, env);
    } catch (error) {
        return new Response(
            new ApiException(
                "GATEWAY_ERROR",
                `An internal API Gateway error has occurred, sorry for the inconvenience.`,
                500
            ).toJSON(),
            { status: 500 }
        );
    }

    let newHeaders = new Headers();

    if(userID === undefined) {
        newHeaders = new Headers(request.headers);
    } else {
        newHeaders.append('x-user-id', userID);
        newHeaders.append('Content-Type', request.headers.get('Content-Type'));
    }

    newHeaders.append('x-api-key', env.SERVICE_API_KEY);

    const response = await fetch(path, {
        method: request.method,
        headers: newHeaders,
        body: request.body
    });

    // Here we should check the response and filter any non-formatted error to a SERVER_ERROR.

    return response;
}