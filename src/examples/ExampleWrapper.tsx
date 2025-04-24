import React from 'react';
import { Web3StateProvider } from '../hooks/useWeb3State';
import BasicExample from './BasicExample';

const ExampleWrapper: React.FC = () => {
  return (
    <Web3StateProvider>
      <BasicExample />
    </Web3StateProvider>
  );
};

export default ExampleWrapper; 