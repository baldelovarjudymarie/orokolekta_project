import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { LoadingScreen } from '../components/LoadingScreen';
import { SplashIntro } from '../components/SplashIntro';
import { useApp } from '../context/AppContext';

/**
 * Startup flow:  native splash (app.json)  ->  animated splash  ->  loading screen  ->  login / dashboard
 */
export default function Index() {
  const router = useRouter();
  const { state } = useApp();
  const [phase, setPhase] = useState<'splash' | 'loading'>('splash');

  useEffect(() => {
    if (phase !== 'loading') return;
    const timer = setTimeout(() => {
      router.replace(state.isAuthenticated ? '/(tabs)' : '/login');
    }, 2200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'splash') {
    return <SplashIntro onDone={() => setPhase('loading')} />;
  }
  return <LoadingScreen duration={2000} />;
}
