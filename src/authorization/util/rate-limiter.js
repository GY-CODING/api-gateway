const Log = require('../../logging/logger.js');

let lastRequestTime = 0;
const RATE_LIMIT_DELAY = 100;

async function rateLimitedRequest(operation) {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest));
    }
    
    lastRequestTime = Date.now();
    return operation();
}

module.exports = {
    rateLimitedRequest
}; 