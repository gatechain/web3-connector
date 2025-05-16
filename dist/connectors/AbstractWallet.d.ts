import { AddEthereumChainParameter } from '../types';
export declare abstract class AbstractWallet {
    provider: any;
    abstract detectProvider(): Promise<unknown>;
    abstract activate(desiredChainIdOrChainParameters?: number | AddEthereumChainParameter): Promise<unknown>;
    abstract autoConnect(): Promise<void>;
    abstract deactivate(): void;
}
