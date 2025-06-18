const { ManagementClient } = require('auth0');

require('dotenv').config();

let managementClient = null;

function getManagementClient() {
    if (!managementClient) {
        managementClient = new ManagementClient({
            domain: process.env.AUTH0_DOMAIN,
            clientId: process.env.AUTH0_CLIENTID,
            clientSecret: process.env.AUTH0_SECRET,
            retry: {
                enabled: true,
                maxRetries: 3
            }
        });
    }
    
    return managementClient;
}

module.exports = {
    getManagementClient
}; 