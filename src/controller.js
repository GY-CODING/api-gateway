const express = require('express');
const routeRequest = require('./routing/api-routing.js');
const fetchAPIDocs = require('./apidocs-fetcher.js');
const ApiException = require('./entities/api-exception.js');

require('dotenv').config();

const app = express();
app.use(express.json({ limit: '30mb' }));

app.all("/health", (req, res) => {
    res.send("UP");
});

app.all(`${process.env.HERALDS_OF_CHAOS_PATH}/{*splat}`, async (req, res) => {
    let routes = [];

    try {
        routes = await fetchAPIDocs(process.env.HERALDS_OF_CHAOS_PATH);
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

    res.set('Content-Type', response.contentType);
    res.status(response.status).send(response.body);
});

app.all(`${process.env.ACCOUNTS_PATH}/{*splat}`, async (req, res) => {
    let routes = [];

    if(req.path === '/accounts/docs') {
        
    }

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

    res.set('Content-Type', response.contentType);
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

    res.set('Content-Type', response.contentType);
    res.status(response.status).send(response.body);
});

app.all(`${process.env.BOOKS_PATH}/{*splat}`, async (req, res) => {
    let routes = [];

    try {
        routes = await fetchAPIDocs(process.env.BOOKS_PATH);
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

    res.set('Content-Type', response.contentType);
    res.status(response.status).send(response.body);
});

app.listen(process.env.PORT, () => {
    console.log(`API Gateway listening on port ${process.env.PORT}`)
});