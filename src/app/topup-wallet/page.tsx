import type { Metadata } from 'next';
import { TopupWallet } from './TopupWallet';

// import { TopupWallet } from './TopupWallet';

export const metadata: Metadata = {
  title: 'Top Up Wallet - Thomson\'s Casa Store',
  description: 'Add money to your wallet for faster checkout and exclusive offers at Thomson\'s Casa Store.',
};

export default function TopupWalletPage() {
  return <TopupWallet />;
}