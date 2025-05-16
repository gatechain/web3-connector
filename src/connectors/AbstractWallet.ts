import { AddEthereumChainParameter } from '../types';

export abstract class AbstractWallet {
  declare public provider: any;
  public abstract detectProvider(): Promise<unknown>;

  public abstract activate(
    desiredChainIdOrChainParameters?: number | AddEthereumChainParameter
  ): Promise<unknown>;

  public abstract autoConnect(): Promise<void>;

  public abstract deactivate(): void;
}
