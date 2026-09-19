/// <reference types="node" />
import React, { useState } from 'react';
import { createRequire } from 'node:module';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import type { StoryPreferences } from '../../../domain/story/types';
import { StoryConfiguratorScreen } from '../StoryConfiguratorScreen';

vi.mock('react-native', () => ({
  ActivityIndicator: 'ActivityIndicator', Image: 'Image', KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: { OS: 'android' }, Pressable: 'Pressable', ScrollView: 'ScrollView', Text: 'Text',
  TextInput: 'TextInput', View: 'View', StyleSheet: { create: (styles: unknown) => styles, absoluteFillObject: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 } },
}));
vi.mock('../../../ui/AnimatedWand', () => ({ AnimatedWand: () => null }));
vi.mock('../environmentArtwork', () => ({ environmentArtwork: {} }));
const require = createRequire(import.meta.url);
const originalPngLoader = require.extensions['.png'];
afterAll(() => {
  if (originalPngLoader) require.extensions['.png'] = originalPngLoader;
  else delete require.extensions['.png'];
});
require.extensions['.png'] = (module) => { module.exports = 1; };
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let renderer: ReactTestRenderer;
afterEach(() => { if (renderer) act(() => renderer.unmount()); });

const initial: StoryPreferences = {
  protagonist: 'Alma', age: 7, companions: [{ id: 'sapo-andres' }], environmentId: 'jardin',
  magicItem: 'Una llave', valueId: 'amistad', toneId: 'calm', paragraphCount: 3, paragraphLength: 'medium', fontId: 'escolar',
};
function setup() {
  const changed = vi.fn();
  function Harness() {
    const [preferences, setPreferences] = useState(initial);
    return <StoryConfiguratorScreen preferences={preferences} onChange={(next) => { changed(next); setPreferences(next); }} onCreate={() => {}} onSurprise={() => {}} />;
  }
  act(() => { renderer = create(<Harness />); });
  const input = (label: string) => renderer.root.findAllByType('TextInput' as never).find((node) => node.props.accessibilityLabel === label)!;
  const button = (label: string) => renderer.root.findAllByType('Pressable' as never).find((node) => node.props.accessibilityLabel === label)!;
  return { changed, input, button };
}

describe('custom configurator choices', () => {
  it('keeps the selected place until Usar confirms a trimmed custom draft', () => {
    const screen = setup();
    act(() => screen.input('Lugar mágico personalizado').props.onChangeText('   '));
    expect(screen.button('Usar lugar personalizado').props.disabled).toBe(true);
    act(() => screen.button('Usar lugar personalizado').props.onPress());
    expect(screen.changed).not.toHaveBeenCalled();
    act(() => screen.input('Lugar mágico personalizado').props.onChangeText('  Una casa del árbol  '));
    expect(screen.changed).not.toHaveBeenCalled();
    act(() => screen.button('Usar lugar personalizado').props.onPress());
    expect(screen.changed).toHaveBeenLastCalledWith(expect.objectContaining({ environmentId: 'custom', customEnvironment: 'Una casa del árbol' }));
  });
  it('keeps the selected lesson until Añadir confirms it and rejects blank drafts', () => {
    const screen = setup();
    act(() => screen.input('Valor o enseñanza personalizada').props.onChangeText('   '));
    expect(screen.button('Añadir enseñanza personalizada').props.disabled).toBe(true);
    act(() => screen.button('Añadir enseñanza personalizada').props.onPress());
    expect(screen.changed).not.toHaveBeenCalled();
    act(() => screen.input('Valor o enseñanza personalizada').props.onChangeText('  Empatía  '));
    expect(screen.changed).not.toHaveBeenCalled();
    act(() => screen.button('Añadir enseñanza personalizada').props.onPress());
    expect(screen.changed).toHaveBeenLastCalledWith(expect.objectContaining({ valueId: 'custom', customValue: 'Empatía' }));
  });
});
