
import { WalletAdapter } from '../wallet-adapters';
import { AccountInfo, Connection, PublicKey } from '@safecoin/web3.js';


export interface WalletContextValues {
  wallet: WalletAdapter | undefined;
  connected: boolean;
  providerUrl: string;
  setProviderUrl: (newProviderUrl: string) => void;
  providerName: string;
  select: () => void;
}

export interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer> | null;
  effectiveMint: PublicKey;
}
