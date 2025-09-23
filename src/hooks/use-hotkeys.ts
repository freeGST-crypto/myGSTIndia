
"use client";

import { useEffect, useCallback } from 'react';

type HotkeyMap = Map<string, (event: KeyboardEvent) => void>;

export function useHotkeys(hotkeys: HotkeyMap, dependencies: any[] = []) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey; // For Mac's Cmd key
    const alt = event.altKey;
    const shift = event.shiftKey;

    let hotkeyString = "";

    if (ctrl) hotkeyString += "ctrl+";
    if (alt) hotkeyString += "alt+";
    if (shift) hotkeyString += "shift+";
    
    hotkeyString += key;
    
    const callback = hotkeys.get(hotkeyString);

    if (callback) {
      event.preventDefault();
      callback(event);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, hotkeys]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
