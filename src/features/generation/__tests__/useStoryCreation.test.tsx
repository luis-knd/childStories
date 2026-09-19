import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useStoryCreation } from '../useStoryCreation';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let renderer: ReactTestRenderer;
afterEach(() => { if (renderer) act(() => renderer.unmount()); });

function setup(generate: () => Promise<string>) {
  const onReady = vi.fn();
  let state: ReturnType<typeof useStoryCreation<string>>;
  function Harness() {
    state = useStoryCreation(generate, onReady);
    return null;
  }
  act(() => { renderer = create(<Harness />); });
  return { current: () => state!, onReady };
}

describe('story creation screen lifecycle', () => {
  it('stays busy until the story arrives and prevents duplicate requests', async () => {
    let finish!: (value: string) => void;
    const generate = vi.fn(() => new Promise<string>((resolve) => { finish = resolve; }));
    const screen = setup(generate);
    let pending!: Promise<void>;
    act(() => { pending = screen.current().create(); void screen.current().create(); });
    expect(screen.current().creating).toBe(true);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(screen.onReady).not.toHaveBeenCalled();
    await act(async () => { finish('cuento'); await pending; });
    expect(screen.current().creating).toBe(false);
    expect(screen.onReady).toHaveBeenCalledWith('cuento');
  });

  it('leaves loading on failure and allows retry without losing the previous story', async () => {
    const generate = vi.fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce('nuevo cuento');
    const screen = setup(generate);
    await act(async () => { await screen.current().create(); });
    expect(screen.current().creating).toBe(false);
    expect(screen.current().error).toBeTruthy();
    expect(screen.onReady).not.toHaveBeenCalled();
    await act(async () => { await screen.current().create(); });
    expect(screen.current().error).toBeUndefined();
    expect(screen.onReady).toHaveBeenCalledWith('nuevo cuento');
  });
});
