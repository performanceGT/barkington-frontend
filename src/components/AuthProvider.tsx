'use client';

import React, { createContext, useContext } from 'react';
import { AuthModal } from './AuthModal';
import { useAuthModal } from '../hooks/useAuthModal';

interface AuthContextType {
  openAuthModal: (redirectUrl?: string) => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isOpen, openAuthModal, closeAuthModal, redirectUrl } = useAuthModal();

  const handleAuthSuccess = () => {
    // You can add any additional logic here after successful authentication
    console.log('Authentication successful');
  };

  return (
    <AuthContext.Provider
      value={{
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen: isOpen,
      }}
    >
      {children}
      <AuthModal
        isOpen={isOpen}
        onClose={closeAuthModal}
        onSuccess={handleAuthSuccess}
        redirectUrl={redirectUrl}
      />
    </AuthContext.Provider>
  );
};