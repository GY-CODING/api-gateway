const jwt = require('jsonwebtoken');
const { fetchMetadataByApiKey } = require('../database/metadata-dao.js')
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
        return (await fetchMetadataByApiKey(apiKey))[0].userId;
    } catch(error) {
        throw new Error("INVALID_API_KEY");
    }
}