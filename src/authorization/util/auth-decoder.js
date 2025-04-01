require('dotenv').config();

module.exports = async function getUserId(authorization) {
    const tokenRegex = /Bearer\s([a-zA-Z0-9\.\-_]+)/;
    
    if(tokenRegex.test(authorization)) {
        return await getUserIdFromToken(authorization)
    } else {
        return await getUserIdFromAPIKey(authorization)
    }
}

async function getUserIdFromToken(token) {
    try {
        const userInfoResponse = await fetch(process.env.AUTH0_USERINFO_URL, {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'application/json'
            }
        });
    
        const userInfo = await userInfoResponse.json();
    
        return userInfo.sub;
    } catch(error) {
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
    
        return await userIdResponse.text();
    } catch(error) {
        throw new Error("INVALID_API_KEY");
    }
}