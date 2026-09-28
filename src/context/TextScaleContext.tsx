import React, { createContext, useContext, useState } from 'react';

export type TextScalePreset = 'mlodziez' | 'senior' | 'senior_max';

export interface TextScaleContextType {
  scale: number;
  preset: TextScalePreset;
  increase: () => void;
  decrease: () => void;
  setPreset: (preset: TextScalePreset) => void;
  setScale: (scale: number) => void;
  isMin: boolean;
  isMax: boolean;
  scalePercent: string;
}

const SCALE_LEVELS: number[] = [0.9, 1.0, 1.18, 1.36];

const TextScaleContext = createContext<TextScaleContextType>({
  scale: 1.0,
  preset: 'mlodziez',
  increase: () => {},
  decrease: () => {},
  setPreset: () => {},
  setScale: () => {},
  isMin: false,
  isMax: false,
  scalePercent: '100%',
});

export const TextScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scale, setScaleState] = useState<number>(1.0);

  const getPresetForScale = (s: number): TextScalePreset => {
    if (s >= 1.3) return 'senior_max';
    if (s >= 1.15) return 'senior';
    return 'mlodziez';
  };

  const setScale = (newScale: number) => {
    const clamped = Math.min(1.4, Math.max(0.85, Math.round(newScale * 100) / 100));
    setScaleState(clamped);
  };

  const setPreset = (p: TextScalePreset) => {
    if (p === 'mlodziez') setScaleState(1.0);
    else if (p === 'senior') setScaleState(1.18);
    else if (p === 'senior_max') setScaleState(1.36);
  };

  const increase = () => {
    const currentIndex = SCALE_LEVELS.findIndex((l) => l >= scale);
    if (currentIndex >= 0 && currentIndex < SCALE_LEVELS.length - 1) {
      setScaleState(SCALE_LEVELS[currentIndex + 1]);
    } else if (scale < 1.36) {
      setScaleState(1.36);
    }
  };

  const decrease = () => {
    const reversed = [...SCALE_LEVELS].reverse();
    const nextLower = reversed.find((l) => l < scale - 0.05);
    if (nextLower !== undefined) {
      setScaleState(nextLower);
    } else {
      setScaleState(SCALE_LEVELS[0]);
    }
  };

  const isMin = scale <= SCALE_LEVELS[0];
  const isMax = scale >= SCALE_LEVELS[SCALE_LEVELS.length - 1];
  const scalePercent = `${Math.round(scale * 100)}%`;
  const preset = getPresetForScale(scale);

  return (
    <TextScaleContext.Provider
      value={{
        scale,
        preset,
        increase,
        decrease,
        setPreset,
        setScale,
        isMin,
        isMax,
        scalePercent,
      }}>
      {children}
    </TextScaleContext.Provider>
  );
};

export function useTextScale(): TextScaleContextType {
  return useContext(TextScaleContext);
}
