import { useContext } from 'react';
import { DemoContext } from './DemoContextInstance';
import type { DemoContextType } from './DemoContextInstance';

export const useDemo = (): DemoContextType => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
