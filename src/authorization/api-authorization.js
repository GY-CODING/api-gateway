const ApiException = require("../entities/api-exception.js");
const log = require("../logging/logger.js");
const LogLevel = require("../entities/log-levels.js");
const getUserId = require("./util/jwt-decoder.js");

async function getManagementApiToken(env) {
    const url = env.AUTH0_TOKEN_URL;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: env.AUTH0_CLIENTID,
            client_secret: env.AUTH0_SECRET,
            audience: env.AUTH0_AUDIENCE_URL,
            grant_type: 'client_credentials'
        })
    });

    if (!response.ok) {
        throw new Error("500");
    }

    const data = await response.json();
    return data.access_token;
}

async function getUserRoles(userID, env) {
    const accessToken   = await getManagementApiToken(env);
    const url           = `${env.AUTH0_USERDATA_URL}${userID}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if(!response.ok) {
        throw new Error("500");
    }

    const userData = await response.json();
    return userData.user_metadata.profile.roles;
}

async function getUserApiKey(userID, env) {
    const accessToken   = await getManagementApiToken(env);
    const url           = `${env.AUTH0_USERDATA_URL}${userID}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if(!response.ok) {
        throw new Error("500");
    }

    const userData = await response.json();
    return userData.user_metadata.profile.apiKey;
}

async function checkRoles(userID, pathRoles, env) {
    pathRoles = pathRoles.split(',');

    let userRoles;
    let response = new Response(
        new ApiException(
            "FORBIDDEN",
            "The user has no permission to access this resource.",
            403
        ).toJSON(),
        { status: 403 }
    );

    try {
        userRoles = await getUserRoles(userID, env);
    } catch(error) {
        switch(error.message) {
            case "404":
                log(LogLevel.ERROR, { message: "No roles were found for this user." }, env)
            case "500":
                log(LogLevel.ERROR, { message: "An error with the authentication service has occurred." }, env)
                return new Response(
                    new ApiException(
                        "AUTH_ERROR",
                        "An error with the authentication service has occurred, sorry for the inconvenience.",
                        500
                    ).toJSON(),
                    { status: 500 }
                );
            default:
                log(LogLevel.ERROR, { message: "An internal API Gateway error has occurred." }, env)
                return new Response(
                    new ApiException(
                        "GATEWAY_ERROR",
                        `An internal API Gateway error has occurred, sorry for the inconvenience.`,
                        500
                    ).toJSON(),
                    { status: 500 }
                );
        }
    }
    
    pathRoles.forEach(role => {
        userRoles.forEach(userRole => {
            if(userRole === role) {
                log(LogLevel.INFO, { message: "User roles to access the resource were found." }, env)
                response = new Response(
                    "User roles to access this endpoint are present.",
                    { status: 200 }
                );
            }
        });
    });

    return response
}

async function checkSession(authorization, env) {
    try {
        const userID = await getUserId(authorization, env);

        let response = new Response(
            "User session is valid.",
            { status: 200 }
        );

        response.headers.append('user-id', userID);

        log(LogLevel.INFO, { message: "User has been successfully authenticated.", authorization: authorization, userId: userID }, env)
        return response;
    } catch(error) {
        if(error.message === "INVALID_TOKEN") {
            log(LogLevel.ERROR, { message: "The authentication token is malformed or expired.", error: error.message }, env)

            return new Response(
                new ApiException(
                    "INVALID_TOKEN",
                    "The provided token is invalid, expired or not even present.",
                    401
                ).toJSON(),
                { status: 401 }
            );
        } else if(error.message === "INVALID_API_KEY") {
            log(LogLevel.ERROR, { message: "The API Key is malformed.", error: error.message }, env)

            return new Response(
                new ApiException(
                    "INVALID_API_KEY",
                    "The provided API Key is invalid.",
                    401
                ).toJSON(),
                { status: 401 }
            );
        } else {
            log(LogLevel.ERROR, { message: "An error with the authentication service has occurred." }, env)
            
            return new Response(
                new ApiException(
                    "AUTH_ERROR",
                    "An error with the authentication service has occurred, sorry for the inconvenience.",
                    500
                ).toJSON(),
                { status: 500 }
            );
        }
    }
}

module.exports = {
    checkRoles,
    checkSession
}