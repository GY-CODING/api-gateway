const { checkSession, checkRoles } = require('../authorization/api-authorization.js');
const getResponse = require('./util/service-fetcher.js');
const validateRequest = require('./util/validator.js');
const { fetchAPIRoutes, fetchAPIDocs } = require('./apidocs-fetcher.js');

const express = require('express');
const route = require('./routing/api-routing.js');

const app = express();
app.use(express.json());

app.all(process.env.FALL_OF_THE_GODS_PATH, async (req, res) => {
    let routes = [];

    try {
        routes = await fetchAPIDocs(process.env.FALL_OF_THE_GODS_PATH);
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

    res.send(route(req), routes);
});

app.all(process.env.ACCOUNTS_PATH, async (req, res) => {
    let routes = [];

    try {
        routes = await fetchAPIDocs(process.env.ACCOUNTS_PATH);
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

    res.send(route(req))
});

app.all(process.env.MESSAGES_PATH, async (req, res) => {
    let routes = [];

    try {
        routes = await fetchAPIDocs(process.env.MESSAGES_PATH);
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

    res.send(route(req))
});

async function route(request, routes) {
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