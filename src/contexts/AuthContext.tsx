'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AuthChangeEvent, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

export type UserRole = 'client' | 'admin' | null;

type AuthContextValue = {
  user: User | null;
  role: UserRole;
  /** True only until the first auth check finishes (use for navbar skeleton) */
  isInitialized: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_EVENTS: AuthChangeEvent[] = ['INITIAL_SESSION', 'SIGNED_IN', 'USER_UPDATED', 'TOKEN_REFRESHED'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const userRef = useRef<User | null>(null);
  const roleRef = useRef<UserRole>(null);

  const fetchRole = useCallback(async (userId: string): Promise<UserRole> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    const nextRole = error ? null : (data?.role ?? null);
    roleRef.current = nextRole;
    setRole(nextRole);
    return nextRole;
  }, []);

  const applySession = useCallback(
    async (nextUser: User | null, event: AuthChangeEvent) => {
      if (event === 'SIGNED_OUT') {
        userRef.current = null;
        roleRef.current = null;
        setUser(null);
        setRole(null);
        return;
      }

      if (!nextUser) {
        // Ignore transient null session during token refresh / tab focus
        return;
      }

      userRef.current = nextUser;
      setUser(nextUser);

      if (ROLE_EVENTS.includes(event)) {
        await fetchRole(nextUser.id);
      }
    },
    [fetchRole]
  );

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (cancelled) return;

        if (error) {
          userRef.current = null;
          roleRef.current = null;
          setUser(null);
          setRole(null);
          return;
        }

        if (session?.user) {
          userRef.current = session.user;
          setUser(session.user);
          await fetchRole(session.user.id);
        }
      } catch {
        if (!cancelled) {
          userRef.current = null;
          roleRef.current = null;
          setUser(null);
          setRole(null);
        }
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      void applySession(session?.user ?? null, event);
    });

    const onVisible = () => {
      if (document.visibilityState !== 'visible' || cancelled) return;

      void (async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (cancelled || !session?.user) return;

        if (userRef.current?.id === session.user.id) {
          if (roleRef.current === null) {
            await fetchRole(session.user.id);
          }
          return;
        }

        await applySession(session.user, 'TOKEN_REFRESHED');
      })();
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [applySession, fetchRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    userRef.current = null;
    roleRef.current = null;
    setUser(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      isInitialized,
      signOut,
    }),
    [user, role, isInitialized, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
