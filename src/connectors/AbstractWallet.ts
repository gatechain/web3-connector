import { AddEthereumChainParameter } from '@web3-react/types';

export abstract class AbstractWallet {
  declare public provider: any;
  public abstract detectProvider(): Promise<unknown>;

  public abstract activate(
    desiredChainIdOrChainParameters?: number | AddEthereumChainParameter
  ): Promise<unknown>;

  public abstract connectEagerly(): Promise<void>;

  public abstract deactivate(): void;
}
