const jwt = require('jsonwebtoken');
const { getManagementClient } = require('./auth0-client');

require('dotenv').config();

module.exports = async function getUserId(authorization) {
    const tokenRegex = /Bearer\s([a-zA-Z0-9\.\-_]+)/;
    
    if(tokenRegex.test(authorization)) {
        return await getUserIdFromToken(authorization)
    } else {
        return await getUserIdFromAPIKey(authorization)
    }
}

async function getUserIdFromToken(authorization) {
    try {
        const token = authorization.split(' ')[1];
        const decodedToken = jwt.decode(token);

        if (!decodedToken || !decodedToken.sub) {
            throw new Error("INVALID_TOKEN");
        }

        await getManagementClient().users.get({ id: decodedToken.sub });
        
        return decodedToken.sub;
    } catch(error) {
        console.log(error);
        if (error.message === "INVALID_TOKEN") {
            throw error;
        }

        throw new Error("INVALID_TOKEN");
    }
}

async function getUserIdFromAPIKey(apiKey) {
    try {
        const userIdResponse = await fetch(`${process.env.ACCOUNTS_URL}/user/metadata/apikey/decode?key=${apiKey}`, {
            method: 'GET',
            headers: {
                'x-api-key': process.env.SERVICE_API_KEY
            }
        });

        const userId = await userIdResponse.text();
    
        return userId;
    } catch(error) {
        throw new Error("INVALID_API_KEY");
    }
}