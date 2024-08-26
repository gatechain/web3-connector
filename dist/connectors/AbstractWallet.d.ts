import { AddEthereumChainParameter } from "@web3-react/types";
export declare abstract class AbstractWallet {
    provider: any;
    abstract detectProvider(): Promise<unknown>;
    abstract activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<unknown>;
    abstract connectEagerly(): Promise<void>;
    abstract deactivate(): void;
}
