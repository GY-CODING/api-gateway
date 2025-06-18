const ApiException = require("./api-exception.js");

const ERROR_RESPONSES = {
    FORBIDDEN: {
        status: 403,
        body: new ApiException(
            "FORBIDDEN",
            "The user has no permission to access this resource.",
            403
        ).toJSON(),
        contentType: 'application/json'
    },
    RATE_LIMIT: {
        status: 429,
        body: new ApiException(
            "RATE_LIMIT_EXCEEDED",
            "Too many requests to the authentication service. Please try again later.",
            429
        ).toJSON(),
        contentType: 'application/json'
    },
    AUTH_ERROR: {
        status: 500,
        body: new ApiException(
            "AUTH_ERROR",
            "An error with the authentication service has occurred, sorry for the inconvenience.",
            500
        ).toJSON(),
        contentType: 'application/json'
    },
    GATEWAY_ERROR: {
        status: 500,
        body: new ApiException(
            "GATEWAY_ERROR",
            "An internal API Gateway error has occurred, sorry for the inconvenience.",
            500
        ).toJSON(),
        contentType: 'application/json'
    },
    INVALID_TOKEN: {
        status: 401,
        body: new ApiException(
            "INVALID_TOKEN",
            "The provided token is invalid, expired or not even present.",
            401
        ).toJSON()
    },
    INVALID_API_KEY: {
        status: 401,
        body: new ApiException(
            "INVALID_API_KEY",
            "The provided API Key is invalid.",
            401
        ).toJSON()
    }
};

module.exports = {
    ERROR_RESPONSES
}; 