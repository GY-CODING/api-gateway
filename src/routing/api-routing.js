const { checkSession, checkRoles } = require('../authorization/api-authorization.js');
const getResponse = require('./util/service-fetcher.js');
const validateRequest = require('./util/validator.js');

require('dotenv').config();

module.exports = async function routeRequest(request, routes) {
    let authorization = "";

    try {
        authorization = request.headers.get('Authorization');
    } catch (error) {
        authorization = null;
    }

    const requestValidationResponse = await validateRequest(request, routes);

    if (requestValidationResponse.status === 401) {
        const sessionCheckResponse = await checkSession(authorization);

        if (!sessionCheckResponse.ok) {
            return sessionCheckResponse;
        }

        const userID = sessionCheckResponse.headers.get('user-id');
        const rolesCheckResponse = await checkRoles(userID, await requestValidationResponse.text());

        if (!rolesCheckResponse.ok) {
            return rolesCheckResponse;
        }

        return getResponse(request, userID);
    }

    if (requestValidationResponse.status === 200) {
        return getResponse(request);
    }

    return requestValidationResponse;
}