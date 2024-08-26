"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseChainId = void 0;
function parseChainId(chainId) {
    return Number.parseInt(chainId, 16);
}
exports.parseChainId = parseChainId;
