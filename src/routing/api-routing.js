const { checkSession, checkRoles } = require('../authorization/api-authorization.js');
const getResponse = require('./util/service-fetcher.js');
const validateRequest = require('./util/validator.js');
const reverseProxy = require('../proxy/reverse-proxy.js');

module.exports = async function route(request, env) {
    let authorization = "";

    try {
        authorization = request.headers.get('Authorization');
    } catch (error) {
        authorization = null;
    }

    const requestValidationResponse = await validateRequest(request, env);

    if (requestValidationResponse.status === 401) {
        const sessionCheckResponse = await checkSession(authorization, env);

        if (!sessionCheckResponse.ok) {
            return sessionCheckResponse;
        }

        const userID = sessionCheckResponse.headers.get('user-id');
        const rolesCheckResponse = await checkRoles(userID, await requestValidationResponse.text(), env);

        if (!rolesCheckResponse.ok) {
            return rolesCheckResponse;
        }

        return getResponse(request, env, userID);
    }

    if (requestValidationResponse.status === 200) {
        return getResponse(request, env);
    }

    return requestValidationResponse;
}