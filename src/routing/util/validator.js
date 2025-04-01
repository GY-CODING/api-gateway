const ApiException = require('../../entities/api-exception.js');

require('dotenv').config();

function validateRequestConfig(request, route) {
    const service   = "/" + request.url.split('/').slice(1)[0];
    let params      = null;

    if (route.method !== request.method) {
        return {
            status: 405,
            body: new ApiException(
                "METHOD_NOT_ALLOWED",
                `Method used to access this resource is not allowed.`,
                405
            ).toJSON()
        }
    }
    
    if (request.url.split('?').length > 1) {

        params = request.url.split('?')[1].split('&');

        let paramNames = new Array();

        params.forEach(param => {
            paramNames.push(param.split('=')[0]);
        });

        try {
            route.queryParameters.forEach(queryParameter => {
                if (paramNames.includes(queryParameter.name) === false) {
                    throw new Error(queryParameter.name);
                }
            });
        } catch (error) {
            return {
                status: 400,
                body: new ApiException(
                    "BAD_REQUEST",
                    `One of the request query parameters is not present or mispelled: ${error.message}`,
                    400
                ).toJSON()
            }
        }
    }

    if (route.service !== service) {
        return {
            status: 400,
            body: new ApiException(
                "BAD_REQUEST",
                `The service is not valid for the requested resource.`,
                400
            ).toJSON()
        }
    }

    for (const header of route.headers) {
        if (header.name === "Authorization") {
            return {
                status: 401,
                body: route.roles
            }
        }
    }

    return {
        status: 200,
        body: 'Request validated.'
    }
}

module.exports = async function validateRequest(request, routes) {
    const path = "/" + request.url.split('/').slice(2).join('/').split('?')[0];

    let routeFound = routes
        .filter(routeObject => {
            const pathRegex = new RegExp(`^${routeObject.path.replace(/{[^}]+}/g, '[^/]+')}$`);
            return pathRegex.test(path);
        })
        .find(routeObjectFiltered => {
            return routeObjectFiltered.method === request.method;
        });

    if (routeFound === undefined) {
        return {
            status: 404,
            body: new ApiException(
                "RESOURCE_NOT_FOUND",
                `This resource was not found.`,
                404
            ).toJSON()
        }
    }
    
    return validateRequestConfig(request, routeFound);
}