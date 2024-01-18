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
exports.GateWallet = exports.NoMetaMaskError = void 0;
const types_1 = require("@web3-react/types");
class NoMetaMaskError extends Error {
    constructor() {
        super("MetaMask not installed");
        this.name = NoMetaMaskError.name;
        Object.setPrototypeOf(this, NoMetaMaskError.prototype);
    }
}
exports.NoMetaMaskError = NoMetaMaskError;
function parseChainId(chainId) {
    return Number.parseInt(chainId, 16);
}
class GateWallet extends types_1.Connector {
    constructor({ actions, options, onError }) {
        super(actions, onError);
        this._switchingChains = true;
        this.options = options;
    }
    isomorphicInitialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.eagerConnection)
                return;
            return (this.eagerConnection = Promise.resolve().then(() => __importStar(require("./detect-provider"))).then((m) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                console.log("m", m);
                const provider = (yield m.default(this.options));
                console.log(provider, "provider");
                if (provider) {
                    this.provider = provider;
                    // handle the case when e.g. metamask and coinbase wallet are both installed
                    console.log(this.provider.providers, "this.provider.providers");
                    if ((_a = this.provider.providers) === null || _a === void 0 ? void 0 : _a.length) {
                        this.provider =
                            (_b = this.provider.providers.find((p) => p.isWeb3Wallet)) !== null && _b !== void 0 ? _b : this.provider.providers[0];
                    }
                    this.provider.on("connect", ({ chainId }) => {
                        this.actions.update({ chainId: parseChainId(chainId) });
                    });
                    this.provider.on("chainChanged", (chainId) => {
                        console.log("chainChanged");
                        this._switchingChains = true;
                        this.actions.update({ chainId: parseChainId(chainId) });
                    });
                    this.provider.on("disconnect", (error) => {
                        var _a;
                        console.log("disconnect");
                        // We need this as MetaMask can emit the "disconnect" event
                        // upon switching chains. This workaround ensures that the
                        // user currently isn't in the process of switching chains.
                        if (this._switchingChains) {
                            this._switchingChains = false;
                            return;
                        }
                        this.actions.resetState();
                        (_a = this.onError) === null || _a === void 0 ? void 0 : _a.call(this, error);
                    });
                    // this.provider.on("accountsChanged", (accounts: string[]): void => {
                    //   console.log("accountsChanged");
                    //   if (accounts.length === 0) {
                    //     // handle this edge case by disconnecting
                    //     this.actions.resetState();
                    //   } else {
                    //     this.actions.update({ accounts });
                    //   }
                    // });
                    this.provider.on("gateAccountChange", (gateWallet) => {
                        var _a;
                        console.log("gateAccountChange", gateWallet);
                        const acc = (_a = this.provider) === null || _a === void 0 ? void 0 : _a.selectedAddress;
                        if (!acc || !(gateWallet === null || gateWallet === void 0 ? void 0 : gateWallet.walletId)) {
                            // handle this edge case by disconnecting
                            this.actions.resetState();
                        }
                        else {
                            this.actions.update({ accounts: [acc] });
                        }
                    });
                }
            })));
        });
    }
    /** {@inheritdoc Connector.connectEagerly} */
    connectEagerly() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const cancelActivation = this.actions.startActivation();
            yield this.isomorphicInitialize();
            if (!this.provider)
                return cancelActivation();
            const result = yield ((_b = (_a = this.provider).getAccount) === null || _b === void 0 ? void 0 : _b.call(_a).then((gc) => {
                console.log(gc, "connectEagerly gc", this.provider);
                // return this.provider?.connect();
                // this.actions.update({
                //   chainId: parseChainId(this.provider?.chainId as string),
                //   accounts: [this.provider?.selectedAddress as string],
                // });
            }).catch((err) => {
                throw err;
            }));
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
     * already connected to this chain, no additional steps will be taken. Otherwise, the user will be prompted to switch
     * to the chain, if one of two conditions is met: either they already have it added in their extension, or the
     * argument is of type AddEthereumChainParameter, in which case the user will be prompted to add the chain with the
     * specified parameters first, before being prompted to switch.
     */
    activate(desiredChainIdOrChainParameters) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let cancelActivation;
            if (!((_b = (_a = this.provider) === null || _a === void 0 ? void 0 : _a.isConnected) === null || _b === void 0 ? void 0 : _b.call(_a)))
                cancelActivation = this.actions.startActivation();
            return this.isomorphicInitialize()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                var _c, _d;
                if (!this.provider)
                    throw new NoMetaMaskError();
                const result = yield ((_d = (_c = this.provider) === null || _c === void 0 ? void 0 : _c.connect) === null || _d === void 0 ? void 0 : _d.call(_c).catch((err) => {
                    throw err;
                }));
                console.log("result", result);
                return Promise.all([
                    this.provider.request({ method: "eth_chainId" }),
                    this.provider.request({ method: "eth_requestAccounts" }),
                ]).then(([chainId, accounts]) => {
                    console.log("ffdfsdf", chainId, accounts);
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
    watchAsset({ address, symbol, decimals, image, }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.provider)
                throw new Error("No provider");
            return this.provider
                .request({
                method: "wallet_watchAsset",
                params: {
                    type: "ERC20",
                    options: {
                        address,
                        symbol,
                        decimals,
                        image, // A string url of the token logo
                    },
                },
            })
                .then((success) => {
                if (!success)
                    throw new Error("Rejected");
                return true;
            });
        });
    }
}
exports.GateWallet = GateWallet;
