"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhantomConnector = exports.Phantom = void 0;
const core_1 = require("@web3-react/core");
const phantom_1 = require("../connectors/phantom");
const types_1 = require("../types");
var phantom_2 = require("../connectors/phantom");
Object.defineProperty(exports, "Phantom", { enumerable: true, get: function () { return phantom_2.Phantom; } });
class PhantomConnector {
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = (0, core_1.initializeConnector)((actions) => new phantom_1.Phantom({ actions }));
        }
        return this.instance;
    }
    static getConnection() {
        const [phantom, phantomHooks] = PhantomConnector.getInstance();
        const phantomConnection = {
            connector: phantom,
            hooks: phantomHooks,
            type: types_1.ConnectionType.PHANTOM,
        };
        return phantomConnection;
    }
}
exports.PhantomConnector = PhantomConnector;
