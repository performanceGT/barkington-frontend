import React from 'react';
import type {Metadata} from 'next';

// import {Onboarding} from './Onboarding';
// import { TabNavigator } from './tab-navigator/TabNavigator';
import AppEntrance from './AppEntrance';
import { TabNavigator } from './tab-navigator/TabNavigator';
// import SessionProvider from './SessionProvider';

// export const metadata: Metadata = {
//   title: 'Onboarding',
//   description:
//     'Welcome to the onboarding page. Start your journey with us and explore the features we offer.',
// };

// export default function Start() {
//   return <Onboarding />;
// }

export const metadata:Metadata = {
  title: 'Tab Navigator',
  description:
    'Explore various tabs and navigate through different sections of the application seamlessly using the Tab Navigator.',
}

export default function Start () {
  // return <SessionProvider>
  //         <AppEntrance>
  //           <TabNavigator/>
  //         </AppEntrance>
  //       </SessionProvider>
  return <AppEntrance>
            <TabNavigator/>
          </AppEntrance>
}
