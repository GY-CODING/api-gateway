const ApiException = require("../entities/api-exception.js");
const Log = require('../logging/logger.js');
const getUserId = require("./util/auth-decoder.js");

require('dotenv').config();

async function getManagementApiToken() {
    const url = process.env.AUTH0_TOKEN_URL;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.AUTH0_CLIENTID,
            client_secret: process.env.AUTH0_SECRET,
            audience: process.env.AUTH0_AUDIENCE_URL,
            grant_type: 'client_credentials'
        })
    });

    if (!response.ok) {
        throw new Error("500");
    }

    const data = await response.json();
    return data.access_token;
}

async function getUserRoles(userID) {
    const accessToken   = await getManagementApiToken();
    const url           = `${process.env.AUTH0_USERDATA_URL}${userID}`;

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

async function checkRoles(userID, pathRoles) {
    let userRoles;
    let response = {
        status: 403,
        body: new ApiException(
            "FORBIDDEN",
            "The user has no permission to access this resource.",
            403
        ).toJSON()
    }

    try {
        userRoles = await getUserRoles(userID);
    } catch(error) {
        switch(error.message) {
            case "404":
                Log.error({ message: "No roles were found for this user." });
            case "500":
                Log.error({ message: "An error with the authentication service has occurred." });
                
                return {
                    status: 500,
                    body: new ApiException(
                        "AUTH_ERROR",
                        "An error with the authentication service has occurred, sorry for the inconvenience.",
                        500
                    ).toJSON()
                }
            default:
                Log.error({ message: "An internal API Gateway error has occurred." });

                return {
                    status: 500,
                    body: new ApiException(
                        "GATEWAY_ERROR",
                        `An internal API Gateway error has occurred, sorry for the inconvenience.`,
                        500
                    ).toJSON()
                }
        }
    }
    
    pathRoles.forEach(role => {
        userRoles.forEach(userRole => {
            if(userRole === role) {
                Log.info({ message: "User roles to access the resource were found." })
                
                response = {
                    status: 200,
                    body: "User roles to access this endpoint are present."
                };
            }
        });
    });

    return response
}

async function checkSession(authorization) {
    try {
        const userID = await getUserId(authorization);

        let response = {
            status: 200,
            body: userID
        };

        Log.info({ message: "User has been successfully authenticated.", authorization: authorization, userId: userID });

        return response;
    } catch(error) {
        if(error.message === "INVALID_TOKEN") {
            Log.error({ message: "The authentication token is malformed or expired.", error: error.message })

            return {
                status: 401,
                body: new ApiException(
                    "INVALID_TOKEN",
                    "The provided token is invalid, expired or not even present.",
                    401
                ).toJSON()
            }
        } else if(error.message === "INVALID_API_KEY") {
            Log.error({ message: "The API Key is malformed.", error: error.message })

            return {
                status: 401,
                body: new ApiException(
                    "INVALID_API_KEY",
                    "The provided API Key is invalid.",
                    401
                ).toJSON()
            }
        } else {
            Log.error({ message: "An error with the authentication service has occurred.", error: error.message })
            
            return {
                status: 500,
                body: new ApiException(
                    "AUTH_ERROR",
                    `An error with the authentication service has occurred, sorry for the inconvenience.`,
                    500
                ).toJSON()
            }
        }
    }
}

module.exports = {
    checkRoles,
    checkSession
}