const Log = require('../logging/logger.js');
const getUserId = require("./util/auth-decoder.js");
const { getManagementClient } = require('./util/auth0-client');
const { rateLimitedRequest } = require('./util/rate-limiter');
const { ERROR_RESPONSES } = require('../entities/errors');

require('dotenv').config();

async function getUserRoles(userID) {
    try {
        const auth0 = getManagementClient();

        return await rateLimitedRequest(async () => {
            const user = await auth0.users.get({ id: userID });
            return user.data.user_metadata.profile.roles;
        });
    } catch (error) {
        if (error.statusCode === 429) {
            Log.error({ message: "Rate limit exceeded for Auth0 Management API." });
            throw new Error("429");
        }

        Log.error({ message: "An error with the authentication service has occurred: " + error.message });

        throw new Error("500");
    }
}

async function handleRoleCheckError(error) {
    switch(error.message) {
        case "404":
            Log.error({ message: "No roles were found for this user." });
            return ERROR_RESPONSES.AUTH_ERROR;
        case "429":
            Log.error({ message: "Rate limit exceeded for Auth0 Management API." });
            return ERROR_RESPONSES.RATE_LIMIT;
        case "500":
            Log.error({ message: "An error with the authentication service has occurred." });
            return ERROR_RESPONSES.AUTH_ERROR;
        default:
            Log.error({ message: "An internal API Gateway error has occurred." });
            return ERROR_RESPONSES.GATEWAY_ERROR;
    }
}

async function checkRoles(userID, pathRoles) {
    let userRoles;

    try {
        userRoles = await getUserRoles(userID);
    } catch(error) {
        return handleRoleCheckError(error);
    }
    
    for (const role of pathRoles) {
        if (userRoles.includes(role)) {
            Log.info({ message: "User roles to access the resource were found." });

            return {
                status: 200,
                body: "User roles to access this endpoint are present."
            };
        }
    }

    return ERROR_RESPONSES.FORBIDDEN;
}

async function handleSessionCheckError(error) {
    if (error.message === "INVALID_TOKEN") {
        Log.error({ message: "The authentication token is malformed or expired.", error: error.message });
        return ERROR_RESPONSES.INVALID_TOKEN;
    }
    
    if (error.message === "INVALID_API_KEY") {
        Log.error({ message: "The API Key is malformed.", error: error.message });
        return ERROR_RESPONSES.INVALID_API_KEY;
    }
    
    Log.error({ message: "An error with the authentication service has occurred.", error: error.message });
    return ERROR_RESPONSES.AUTH_ERROR;
}

async function checkSession(authorization) {
    try {
        const userID = await getUserId(authorization);
        Log.info({ message: "User has been successfully authenticated.", authorization, userId: userID });
        
        return {
            status: 200,
            body: userID
        };
    } catch(error) {
        return handleSessionCheckError(error);
    }
}

module.exports = {
    checkSession,
    checkRoles
};