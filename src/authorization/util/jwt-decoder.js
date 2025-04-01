module.exports = async function getUserId(authorization, env) {
    const tokenRegex = /Bearer\s([a-zA-Z0-9\.\-_]+)/;
    
    if(tokenRegex.test(authorization)) {
        return await getUserIdFromToken(authorization, env)
    } else {
        return await getUserIdFromAPIKey(authorization, env)
    }
}

async function getUserIdFromToken(token, env) {
    try {
        const userInfoResponse = await fetch(env.AUTH0_USERINFO_URL, {
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

async function getUserIdFromAPIKey(apiKey, env) {
    try {
        const userIdResponse = await fetch(`${env.ACCOUNTS_URL}/user/metadata/apikey/decode?key=${apiKey}`, {
            method: 'GET',
            headers: {
                'x-api-key': env.SERVICE_API_KEY
            }
        });
    
        return await userIdResponse.text();
    } catch(error) {
        throw new Error("INVALID_API_KEY");
    }
}