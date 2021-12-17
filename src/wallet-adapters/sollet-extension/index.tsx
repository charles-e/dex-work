import Wallet from '@safecoin/safe-wallet-adapter';
import { notify } from '../../ui/notifications';

export function SolletExtensionAdapter(_, network) {
  const sollet = (window as any).sollet;
  if (sollet) {
    return new Wallet(sollet, network);
  }

  return {
    on: () => {},
    connect: () => {
      notify({
        message: 'Sollet Extension Error',
        description: 'Please install the Sollet Extension for Chrome',
      });
    }
  }
}