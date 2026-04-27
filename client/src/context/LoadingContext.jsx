import { createContext, useContext, useState, useEffect } from 'react';

const Ctx = createContext({ loading: false });

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onStart = () => setLoading(true);
    const onEnd   = () => setLoading(false);
    window.addEventListener('api:loading:start', onStart);
    window.addEventListener('api:loading:end',   onEnd);
    return () => {
      window.removeEventListener('api:loading:start', onStart);
      window.removeEventListener('api:loading:end',   onEnd);
    };
  }, []);

  return <Ctx.Provider value={{ loading }}>{children}</Ctx.Provider>;
}

export function useLoading() { return useContext(Ctx); }
