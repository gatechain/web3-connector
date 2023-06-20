"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phantom = exports.NoPhantomError = void 0;
const types_1 = require("@web3-react/types");
class NoPhantomError extends Error {
    constructor() {
        super("Phantom not installed");
        this.name = NoPhantomError.name;
        Object.setPrototypeOf(this, NoPhantomError.prototype);
    }
}
exports.NoPhantomError = NoPhantomError;
function parseChainId(chainId) {
    return Number.parseInt(chainId, 16);
}
class Phantom extends types_1.Connector {
    constructor({ actions, options, onError }) {
        super(actions, onError);
        this.options = options;
    }
    isomorphicInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.eagerConnection)
                return;
            return (this.eagerConnection = Promise.resolve().then(() => __importStar(require("./detect"))).then((m) => __awaiter(this, void 0, void 0, function* () {
                const provider = yield m.default(Object.assign({ mustBePhantom: false }, this.options));
                console.log("m:provider", provider);
                if (provider.isPhantom) {
                    this.provider = provider;
                    this.provider.on("connect", ({ chainId }) => {
                        this.actions.update({ chainId: parseChainId(chainId) });
                    });
                    this.provider.on("disconnect", (error) => {
                        var _a;
                        this.actions.resetState();
                        (_a = this.onError) === null || _a === void 0 ? void 0 : _a.call(this, error);
                    });
                    this.provider.on("chainChanged", (chainId) => {
                        this.actions.update({ chainId: parseChainId(chainId) });
                    });
                    this.provider.on("accountsChanged", (accounts) => {
                        if (accounts.length === 0) {
                            // handle this edge case by disconnecting
                            this.actions.resetState();
                        }
                        else {
                            this.actions.update({ accounts });
                        }
                    });
                }
            })));
        });
    }
    /** {@inheritdoc Connector.connectEagerly} */
    connectEagerly() {
        return __awaiter(this, void 0, void 0, function* () {
            const cancelActivation = this.actions.startActivation();
            yield this.isomorphicInitialize();
            if (!this.provider)
                return cancelActivation();
            return Promise.all([
                this.provider.request({ method: "eth_chainId" }),
                this.provider.request({ method: "eth_accounts" }),
            ])
                .then(([chainId, accounts]) => {
                if (accounts.length) {
                    this.actions.update({ chainId: parseChainId(chainId), accounts });
                }
                else {
                    throw new Error("No accounts returned");
                }
            })
                .catch((error) => {
                console.debug("Could not connect eagerly", error);
                cancelActivation();
            });
        });
    }
    /**
     * Initiates a connection.
     *
     * @param desiredChainIdOrChainParameters - If defined, indicates the desired chain to connect to. If the user is
     * already connected to this chain, no additional steps will be taken. Otherwise, the user will switch
     * to the chain.
     */
    activate(desiredChainIdOrChainParameters) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let cancelActivation;
            if (!((_b = (_a = this.provider) === null || _a === void 0 ? void 0 : _a.isConnected) === null || _b === void 0 ? void 0 : _b.call(_a)))
                cancelActivation = this.actions.startActivation();
            return this.isomorphicInitialize()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                if (!this.provider)
                    throw new NoPhantomError();
                return Promise.all([
                    this.provider.request({ method: "eth_chainId" }),
                    this.provider.request({ method: "eth_requestAccounts" }),
                ]).then(([chainId, accounts]) => {
                    const receivedChainId = parseChainId(chainId);
                    const desiredChainId = typeof desiredChainIdOrChainParameters === "number"
                        ? desiredChainIdOrChainParameters
                        : desiredChainIdOrChainParameters === null || desiredChainIdOrChainParameters === void 0 ? void 0 : desiredChainIdOrChainParameters.chainId;
                    // if there's no desired chain, or it's equal to the received, update
                    if (!desiredChainId || receivedChainId === desiredChainId)
                        return this.actions.update({ chainId: receivedChainId, accounts });
                    const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
                    // if we're here, we can try to switch networks
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    return this.provider.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: desiredChainIdHex }],
                    })
                        .catch((error) => {
                        if (error.code === 4902 &&
                            typeof desiredChainIdOrChainParameters !== "number") {
                            // if we're here, we can try to add a new network
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            return this.provider.request({
                                method: "wallet_addEthereumChain",
                                params: [
                                    Object.assign(Object.assign({}, desiredChainIdOrChainParameters), { chainId: desiredChainIdHex }),
                                ],
                            });
                        }
                        throw error;
                    })
                        .then(() => this.activate(desiredChainId));
                });
            }))
                .catch((error) => {
                cancelActivation === null || cancelActivation === void 0 ? void 0 : cancelActivation();
                throw error;
            });
        });
    }
}
exports.Phantom = Phantom;
