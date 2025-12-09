import type { Metadata } from 'next';

import { TabNavigator } from './TabNavigator';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Discover delicious food and explore our menu at Thomson\'s Casa Store. Order your favorite dishes with ease.',
};

export default async function TabNavigatorPage() {
  return <TabNavigator />;
}
