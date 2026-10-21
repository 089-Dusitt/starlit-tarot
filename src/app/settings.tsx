import { createContext, useContext, useState, type ReactNode } from 'react';
import { loadSettings, defaultSettings, writeStored, type Settings } from '../services/storage';
const Context = createContext<{
  settings: Settings;
  update: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}>({ settings: defaultSettings(), update: () => {} });
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(loadSettings);
  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((old) => {
      const next = { ...old, [key]: value };
      writeStored('settings', next);
      return next;
    });
  }
  return <Context.Provider value={{ settings, update }}>{children}</Context.Provider>;
}
export const useSettings = () => useContext(Context);
