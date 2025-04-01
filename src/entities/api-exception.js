const OWNER = "API_GATEWAY";

module.exports = class ApiException {
    constructor(code, message, status) {
        this.code       = code;
        this.message    = message;
        this.owner      = OWNER;
        this.status     = status;
    }

    toJSON() {
        return `{
            "code": "${this.code}",
            "message": "${this.message}",
            "owner": "${this.owner}",
            "status": ${this.status}
        }`;
    }
}