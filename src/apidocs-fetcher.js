const yaml = require('js-yaml');
const { MongoClient } = require('mongodb');
const Route = require('./entities/route.js');

require('dotenv').config();

function getParameter(ref, components) {
    const parameter = ref.replace(/^#\//, '').split('/').pop();

    if (parameter in components.parameters) {
        return components.parameters[parameter];
    }
}

async function fetchAPIRoutes() {
    const apiDocsServicesPaths = [
        process.env.FALL_OF_THE_GODS_DOCS_PATH,
        process.env.ACCOUNTS_DOCS_PATH,
        process.env.MESSAGES_DOCS_PATH
    ];

    const routes = new Array();

    for (const servicePath of apiDocsServicesPaths) {
        const response = await fetch(servicePath);
        const yamlText = await response.text();
        const openApiSpec = yaml.load(yamlText);

        const paths = openApiSpec.paths;

        for (const path in paths) {
            for (const method in paths[path]) {
                const route = paths[path][method];
                const parameters = route.parameters || [];
                const roles = route['x-roles'] || [];

                const resolvedParameters = parameters.map(param => {
                    if (param.$ref) {
                        return getParameter(param.$ref, openApiSpec.components);
                    }
                    return param;
                });

                const queryParameters = resolvedParameters.filter(p => p.in === 'query');
                const pathVariables = resolvedParameters.filter(p => p.in === 'path');
                const headers = resolvedParameters.filter(p => p.in === 'header');
                const body = route.requestBody ? route.requestBody.content : null;

                const routeObject = new Route(
                    "/" + openApiSpec.servers[0].url.split('/')[3],
                    path,
                    method.toUpperCase(),
                    queryParameters,
                    pathVariables,
                    headers,
                    body,
                    roles
                );

                routes.push(routeObject);
            }
        }
    }

    return routes;
}

async function fetchAPIDocs(service) {    
    const client = new MongoClient("mongodb+srv://gycoding:iggycoding-05@fallofthegods.zsllqn9.mongodb.net/");
    await client.connect();
    
    const db = client.db("APIGateway");
    const collection = db.collection("APIDocs");

    const docs = await collection.find({ service }).toArray();
    return docs;
}

module.exports = {
    fetchAPIRoutes,
    fetchAPIDocs
};