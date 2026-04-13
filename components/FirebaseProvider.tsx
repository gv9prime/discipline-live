'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  browserPopupRedirectResolver,
  signInAnonymously,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  authError: string | null;
  login: () => Promise<void>;
  loginAnonymously: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Ensure user document exists
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef).catch(() => null);
          
          if (!userSnap || !userSnap.exists()) {
            await setDoc(userRef, {
              uid: user.uid,
              displayName: user.displayName || (user.isAnonymous ? 'Convidado' : 'User'),
              photoURL: user.photoURL || '',
              streak: 0,
              dailyGoal: 100,
              completedTasks: 0,
              pendingTasks: 0,
              waterIntake: 0,
              sleepQuality: 0,
              createdAt: new Date().toISOString(),
              isAnonymous: user.isAnonymous || false
            }, { merge: true }).catch(err => console.error('Failed to create user doc:', err));
          }
          setUser(user);
          setLoading(false);
          setAuthError(null);
          setIsLocalMode(false);
        } else {
          // Automatically sign in anonymously if no user is present
          signInAnonymously(auth).catch(err => {
            console.warn('Auto anonymous login failed, falling back to Local Mode:', err.message);
            if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
              // Fallback to local mode silently
              setIsLocalMode(true);
              setAuthError(null);
            } else {
              setAuthError('Erro ao iniciar sessão automaticamente: ' + err.message);
            }
            setLoading(false);
          });
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    } catch (error: any) {
      console.error('Google Login failed:', error);
      if (error.code === 'auth/popup-blocked') {
        throw new Error('O popup foi bloqueado pelo navegador.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('Este domínio não está autorizado no Firebase Console.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('O login com Google não está ativado no Firebase Console. Por favor, ative-o em Authentication > Sign-in method.');
      }
      throw error;
    }
  };

  const loginAnonymously = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Anonymous login failed:', error);
      if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/admin-restricted-operation') {
        setIsLocalMode(true);
        throw new Error('O login anónimo não está ativado. A entrar em Modo Local.');
      }
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Email login failed:', error);

      // Emergency Bypass for the user gvenanciocoelho@gmail.com
      if (email.toLowerCase() === 'gvenanciocoelho@gmail.com' && pass === '2010Ninjago20@' && error.code === 'auth/operation-not-allowed') {
        console.warn('Emergency Bypass activated for gvenanciocoelho@gmail.com');
        setIsLocalMode(true);
        setUser({
          uid: 'local-user',
          displayName: 'Gvenancio Coelho',
          email: 'gvenanciocoelho@gmail.com',
          isAnonymous: false,
          photoURL: 'https://picsum.photos/seed/gvenancio/100/100'
        } as any);
        setAuthError(null);
        return;
      }

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Email ou palavra-passe incorretos.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('O formato do email é inválido.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('O login com Email/Senha não está ativado no Firebase Console. Por favor, ative-o em Authentication > Sign-in method > Email/Password.');
      }
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
    } catch (error: any) {
      console.error('Registration failed:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Este email já está a ser utilizado.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('A palavra-passe deve ter pelo menos 6 caracteres.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('O registo com Email/Senha não está ativado no Firebase Console. Por favor, ative-o em Authentication > Sign-in method > Email/Password.');
      }
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset failed:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('Não foi encontrado nenhum utilizador com este email.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('O formato do email é inválido.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsLocalMode(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <FirebaseContext.Provider value={{ 
      user: isLocalMode ? (user || ({ uid: 'local-user', displayName: 'Utilizador Local', isAnonymous: true } as any)) : user, 
      loading, 
      authError: isLocalMode ? null : authError, 
      login, 
      loginAnonymously, 
      loginWithEmail, 
      registerWithEmail, 
      resetPassword, 
      logout 
    }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
