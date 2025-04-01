const ApiException = require('../../entities/api-exception.js');
const { fetchAPIRoutes, fetchAPIDocs } = require('./apidocs-fetcher.js');

function validateRequestConfig(request, route) {
    const service   = "/" + request.url.split('/').slice(3)[0];
    let params      = null;

    if (route.method !== request.method) {
        return new Response(
            new ApiException(
                "METHOD_NOT_ALLOWED",
                `Method used to access this resource is not allowed.`,
                405
            ).toJSON(),
            { status: 405 }
        );
    }

    if (request.url.split('/').slice(4).join('/').split('?').length > 1) {
        params = request.url.split('/').slice(4).join('/').split('?')[1].split('&');

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
            console.error(error);
            return new Response(
                new ApiException(
                    "BAD_REQUEST",
                    `One of the request query parameters is not present or mispelled: ${error.message}`,
                    400
                ).toJSON(),
                { status: 400 }
            );
        }
    }

    if (route.service !== service) {
        return new Response(
            new ApiException(
                "BAD_REQUEST",
                `The service is not valid for the requested resource.`,
                400
            ).toJSON(),
            { status: 400 }
        );
    }

    for (const header of route.headers) {
        if (header.name === "Authorization") {
            return new Response(
                route.roles,
                { status: 401 }
            );
        }
    }

    return new Response(
        "Request is valid.",
        { status: 200 }
    );
}

module.exports = async function validateRequest(request, env) {
    const path = "/" + request.url.split('/').slice(4).join('/').split('?')[0];
    let routes = null;

    try {
        routes = await fetchAPIRoutes(env);
    } catch (error) {
        return new Response(
            new ApiException(
                "GATEWAY_ERROR",
                `An internal API Gateway error has occurred, sorry for the inconvenience.`,
                500
            ).toJSON(),
            { status: 500 }
        );
    }

    let routeFound = routes
        .filter(routeObject => {
            const pathRegex = new RegExp(`^${routeObject.path.replace(/{[^}]+}/g, '[^/]+')}$`);
            return pathRegex.test(path);
        })
        .find(routeObjectFiltered => {
            return routeObjectFiltered.method === request.method;
        });

    if (routeFound === undefined) {
        return new Response(
            new ApiException(
                "RESOURCE_NOT_FOUND",
                `This resource was not found.`,
                404
            ).toJSON(),
            { status: 404 }
        );
    }
    
    return validateRequestConfig(request, routeFound);
}