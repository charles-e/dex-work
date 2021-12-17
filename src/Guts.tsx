import React, { useEffect, useMemo, useState } from 'react';
import './Guts.css';
import './ClusterSelect';
import Wallet from '@safecoin/safe-wallet-adapter';
import WalletConnect from "./components/WalletConnect";
import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SAFE
} from '@safecoin/web3.js';
import {  useConnectionConfig } from './providers/connection';
import ClusterSelect from './ClusterSelect';
import { useWallet } from './providers/wallet';


function toHex(buffer: Buffer) {
  return Array.prototype.map
    .call(buffer, (x: number) => ('00' + x.toString(16)).slice(-2))
    .join('');
}

function Guts(): React.ReactElement {
  const [logs, setLogs] = useState<string[]>([]);
  function addLog(log: string) {
    setLogs((logs) => [...logs, log]);
  }
  const { connected, wallet } = useWallet();

  const {endpoint} = useConnectionConfig();
  const [cluster, setCluster] = useState(endpoint);
  const [providerUrl, setProviderUrl] = useState('https://www.sollet.io');
  const connection = useMemo(() => new Connection(cluster), [cluster]);
  const urlWallet = useMemo(
    () => new Wallet(providerUrl, cluster),
    [providerUrl, cluster],
  );
  const injectedWallet = useMemo(() => {
    try {
      return new Wallet(
        (window as unknown as { solana: unknown }).solana,
        cluster,
      );
    } catch (e) {
      console.log(`Could not create injected wallet`, e);
      return null;
    }
  }, [cluster]);
  const [selectedWallet, setSelectedWallet] = useState<
    Wallet | undefined | null
  >(undefined);
  const [, setConnected] = useState(false);
  useEffect(() => {
    if (selectedWallet) {
      selectedWallet.on('connect', () => {
        setConnected(true);
        addLog(
          `Connected to wallet ${selectedWallet.publicKey?.toBase58() ?? '--'}`,
        );
      });
      selectedWallet.on('disconnect', () => {
        setConnected(false);
        addLog('Disconnected from wallet');
      });
      void selectedWallet.connect();
      return () => {
        void selectedWallet.disconnect();
      };
    }
  }, [selectedWallet]);

  async function sendTransaction() {
    try {
      const pubkey = selectedWallet?.publicKey;
      if (!pubkey || !selectedWallet) {
        throw new Error('wallet not connected');
      }
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: pubkey,
          toPubkey: pubkey,
          lamports: 100,
        }),
      );
      addLog('Getting recent blockhash');
      transaction.recentBlockhash = (
        await connection.getRecentBlockhash()
      ).blockhash;
      addLog('Sending signature request to wallet');
      transaction.feePayer = pubkey;
      const signed = await selectedWallet.signTransaction(transaction);
      addLog('Got signature, submitting transaction');
      const signature = await connection.sendRawTransaction(signed.serialize());
      addLog('Submitted transaction ' + signature + ', awaiting confirmation');
      await connection.confirmTransaction(signature, 'singleGossip');
      addLog('Transaction ' + signature + ' confirmed');
    } catch (e) {
      console.warn(e);
      addLog(`Error: ${(e as Error).message}`);
    }
  }

  async function signMessage() {
    try {
      if (!wallet) {
        throw new Error('wallet not connected');
      }
      const message =
        'Please sign this message for proof of address ownership.';
      addLog('Sending message signature request to wallet');
      const data = new TextEncoder().encode(message);
      const signed = await wallet.sign(data, 'hex');
      addLog('Got signature: ' + toHex(signed.signature));
    } catch (e) {
      console.warn(e);
      addLog(`Error: ${(e as Error).message}`);
    }
  }
  async function getBalance() {
    try {
      if (!wallet) {
        throw new Error('wallet not connected');
      }
      const key : PublicKey | null  = wallet.publicKey;
      if (!key){
        throw new Error('wallet with no pubkey????');
      }
      const balance = await connection.getBalance(key,connection.commitment);
      const strBal : string = (balance / LAMPORTS_PER_SAFE).toString();
      addLog('Got balance: ' + strBal);
    } catch (e) {
      console.warn(e);
      addLog(`Error: ${(e as Error).message}`);
    }
  }
  interface DOMEvent {
    'target': {
      'value' : string
    }
  }
  function handleSelWallet(event: DOMEvent) {
    if (!event) { return; }
     setProviderUrl(event?.target?.value);
  }

  function handleNewCluster(ep : string) {
     setCluster(ep);
     console.log("recogize %s", ep);
  }

  return (
    <div className="App">
      <h1>Wallet Adapter Demo</h1>
      <div>Network: <ClusterSelect handler={handleNewCluster}/></div>
      <div>
        Waller provider:{' '}
        <select id="selProvider" onChange={handleSelWallet}>
        <option id='1' value="https://www.sollet.io" >Sollet</option>
        <option id='2' value="https://wallet.safecoin.org" >Safecoin</option>
        </select>
        <input
          type="text"
          value={providerUrl}
          onChange={(e) => setProviderUrl(e.target.value.trim())}
        />
      </div>
      {wallet && wallet.connected ? (
        <div>
          <div>Wallet address: {wallet.publicKey?.toBase58()}.</div>
          <button onClick={sendTransaction}>Send Transaction</button>
          <button onClick={signMessage}>Sign Message</button>
          <button onClick={getBalance}>Get Balance</button>

          <button onClick={() => wallet.disconnect()}>
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <WalletConnect/>
        </div>
      )}
      <hr />
      <div className="logs">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}

export default Guts;
