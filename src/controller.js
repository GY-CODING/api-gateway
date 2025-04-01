const express = require('express');
const routeRequest = require('./routing/api-routing.js');
const { fetchAPIDocs } = require('./apidocs-fetcher.js');

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

    res.send(routeRequest(req), routes);
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

    res.send(routeRequest(req))
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

    res.send(routeRequest(req))
});