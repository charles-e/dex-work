import React, { Suspense } from 'react';
import { ConnectionProvider } from './providers/connection';
import  Guts  from './Guts';
import { WalletProvider } from './providers/wallet';

export default function App() {
  return (
        <ConnectionProvider>
          <WalletProvider>
          <Guts />
          </WalletProvider>
        </ConnectionProvider>
  );
}
