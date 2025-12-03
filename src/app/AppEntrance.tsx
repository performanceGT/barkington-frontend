'use client'

import React, { useEffect } from 'react'
import { stores } from '@/stores'

type Props = {
  children : React.ReactNode
}

export const AppEntrance: React.FC<Props> = ({children}) => {
  const {isFirstTime,updateFirstTimeVisitFlag} = stores.useGlobalStore()

  useEffect(() => {
    if (isFirstTime) {
      const timer = setTimeout(() => {
        updateFirstTimeVisitFlag()
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isFirstTime, updateFirstTimeVisitFlag])

  return (
    <>
      {!isFirstTime ? (
        children
      ) : (
        <div
          className='lottie_player'
          style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            overflow: 'hidden'
          }}
        >
          <style>{`
            @keyframes fadeInScale {
              0% {
                opacity: 0;
                transform: scale(0.8);
              }
              50% {
                opacity: 1;
              }
              100% {
                opacity: 1;
                transform: scale(1.1);
              }
            }

            .animated-logo {
              animation: fadeInScale 2.5s ease-in-out forwards;
            }
          `}</style>
          <img
            src="/assets/icons/BARKINGTON_bg.png"
            alt="Loading"
            className="animated-logo"
            style={{ 
              maxWidth: '60%', 
              height: 'auto'
            }}
          />
        </div>
      )}
    </>
  )
}

export default AppEntrance