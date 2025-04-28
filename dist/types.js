var ConnectionType;
(function (ConnectionType) {
    ConnectionType["INJECTED"] = "INJECTED";
    ConnectionType["GATEWALLET"] = "GATEWALLET";
    ConnectionType["PHANTOM"] = "PHANTOM";
    ConnectionType["WALLET_CONNECT"] = "WALLET_CONNECT";
    ConnectionType["WALLET_CONNECT_NOTQR"] = "WALLET_CONNECT_NOTQR";
    ConnectionType["Unisat"] = "UNISAT";
    ConnectionType["SUI"] = "SUI";
    ConnectionType["GATEAPPWALLET"] = "GATE_APP_WALLET";
})(ConnectionType || (ConnectionType = {}));

export { ConnectionType };
