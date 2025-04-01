const express = require('express');
const routeRequest = require('./routing/api-routing.js');
const { fetchAPIDocs } = require('./apidocs-fetcher.js');
const ApiException = require('./entities/api-exception.js');

require('dotenv').config();

const app = express();
app.use(express.json());

app.all("/health", (req, res) => {
    res.send("UP");
});

app.all(`${process.env.FALL_OF_THE_GODS_PATH}/{*splat}`, async (req, res) => {
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

    res.send(await routeRequest(req, routes));
});

app.all(`${process.env.ACCOUNTS_PATH}/{*splat}`, async (req, res) => {
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

    res.send(await routeRequest(req, routes));
});

app.all(`${process.env.MESSAGES_PATH}/{*splat}`, async (req, res) => {
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

    res.send(await routeRequest(req, routes));
});

app.listen(process.env.PORT, () => {
    console.log(`API Gateway listening on port ${process.env.PORT}`)
});