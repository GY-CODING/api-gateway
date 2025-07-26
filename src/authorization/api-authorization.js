const Log = require('../logging/logger.js');
const getUserId = require("./util/auth-decoder.js");
const { fetchMetadataByUserId } = require('./database/metadata-dao.js');
const { ERROR_RESPONSES } = require('../entities/errors');

require('dotenv').config();

async function getUserRoles(userID) {
    try {
        return (await fetchMetadataByUserId(userID))[0].profile.roles;
    } catch (error) {
        Log.error({ message: "An error fetching metadata has occurred: " + error.message });

        throw new Error("500");
    }
}

async function checkRoles(userID, pathRoles) {
    let userRoles;

    try {
        userRoles = await getUserRoles(userID);
    } catch(error) {
        switch(error.message) {
            case "500":
                Log.error({ message: "An error fetching metadata has occurred.", error: error.message });
                return ERROR_RESPONSES.AUTH_ERROR;
            default:
                Log.error({ message: "An internal API Gateway error has occurred.", error: error.message });
                return ERROR_RESPONSES.GATEWAY_ERROR;
        }
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

async function checkSession(authorization) {
    try {
        const userID = await getUserId(authorization);
        Log.info({ message: "User has been successfully authenticated.", authorization, userId: userID });
        
        return {
            status: 200,
            body: userID
        };
    } catch(error) {
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
}

module.exports = {
    checkSession,
    checkRoles
};