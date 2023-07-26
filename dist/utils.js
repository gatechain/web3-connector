"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.isWallet = void 0;
const isWallet = (params) => {
    const ethereum = window === null || window === void 0 ? void 0 : window.ethereum;
    if (params === "MetaMask") {
        return (ethereum === null || ethereum === void 0 ? void 0 : ethereum.isMetaMask) || false;
    }
    if (params === "TokenPocket") {
        return (ethereum === null || ethereum === void 0 ? void 0 : ethereum.isTokenPocket) || false;
    }
    return false;
};
exports.isWallet = isWallet;
const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));
exports.delay = delay;
