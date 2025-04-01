const express = require('express');
const routeRequest = require('./routing/api-routing.js');
const fetchAPIDocs = require('./apidocs-fetcher.js');
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
        res.status(500).send(
            new ApiException(
                "GATEWAY_ERROR",
                `An internal API Gateway error has occurred, sorry for the inconvenience.`,
                500
            ).toJSON()
        );
    }

    const response = await routeRequest(req, routes);

    res.status(response.status).send(response.body);
});

app.all(`${process.env.ACCOUNTS_PATH}/{*splat}`, async (req, res) => {
    let routes = [];

    try {
        routes = await fetchAPIDocs(process.env.ACCOUNTS_PATH);
    } catch (error) {
        res.status(500).send(
            new ApiException(
                "GATEWAY_ERROR",
                `An internal API Gateway error has occurred, sorry for the inconvenience.`,
                500
            ).toJSON()
        );
    }

    const response = await routeRequest(req, routes);
    console.log(response);
    res.status(response.status).send(response.body);
});

app.all(`${process.env.MESSAGES_PATH}/{*splat}`, async (req, res) => {
    let routes = [];

    try {
        routes = await fetchAPIDocs(process.env.MESSAGES_PATH);
    } catch (error) {
        res.status(500).send(
            new ApiException(
                "GATEWAY_ERROR",
                `An internal API Gateway error has occurred, sorry for the inconvenience.`,
                500
            ).toJSON()
        );
    }

    const response = await routeRequest(req, routes);

    res.status(response.status).send(response.body);
});

app.listen(process.env.PORT, () => {
    console.log(`API Gateway listening on port ${process.env.PORT}`)
});