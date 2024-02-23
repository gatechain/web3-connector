"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRejectError = exports.ConnectorNotFoundError = void 0;
class ConnectorNotFoundError extends Error {
    constructor() {
        super('Connector not found, probably because the plugin is not installed.');
        this.name = 'ConnectorNotFoundError';
    }
}
exports.ConnectorNotFoundError = ConnectorNotFoundError;
class UserRejectError extends Error {
    constructor() {
        super('User rejected the request.');
        this.name = 'UserRejectError';
    }
}
exports.UserRejectError = UserRejectError;
UserRejectError.code = 4001;
