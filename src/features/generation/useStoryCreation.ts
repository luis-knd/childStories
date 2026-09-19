import { useRef, useState } from 'react';

export function useStoryCreation<T>(generate: () => Promise<T>, onReady: (story: T) => void) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>();
  const inFlight = useRef(false);

  const create = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(undefined);
    setCreating(true);
    try {
      onReady(await generate());
    } catch {
      setError('No hemos podido preparar el cuento. Tus ideas siguen guardadas. Inténtalo de nuevo.');
    } finally {
      inFlight.current = false;
      setCreating(false);
    }
  };

  return { creating, error, create, clearError: () => setError(undefined) };
}
