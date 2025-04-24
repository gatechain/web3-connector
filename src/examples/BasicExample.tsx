import React from 'react';
import { ConnectionType } from '../types';
import { useWeb3State } from '../hooks/useWeb3State';

const BasicExample: React.FC = () => {
  const {
    isActive: isConnected,
    isActivating: isConnecting,
    account: address,
    chainId,
    connector,
    currentWallet: connectiorName,
    connect,
    disconnect
  } = useWeb3State();

  const handleConnect = async (type: ConnectionType) => {
    try {
      await connect(type);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Web3 Connector Example</h1>
      
      {/* 连接状态 */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Connection Status</h3>
        <p>Status: {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Not Connected'}</p>
        {isConnected && (
          <>
            <p>Address: {address}</p>
            <p>Chain ID: {chainId}</p>
            <p>Wallet Type: {connectiorName}</p>
          </>
        )}
      </div>

      {/* 连接按钮 */}
      {!isConnected && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Connect Wallet</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleConnect(ConnectionType.INJECTED)}
              disabled={isConnecting}
            >
              Connect MetaMask
            </button>
            <button
              onClick={() => handleConnect(ConnectionType.WALLET_CONNECT)}
              disabled={isConnecting}
            >
              WalletConnect
            </button>
            <button
              onClick={() => handleConnect(ConnectionType.GATEWALLET)}
              disabled={isConnecting}
            >
              Gate Wallet
            </button>
          </div>
        </div>
      )}

      {/* 断开连接按钮 */}
      {isConnected && (
        <div>
          <button onClick={disconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default BasicExample; 