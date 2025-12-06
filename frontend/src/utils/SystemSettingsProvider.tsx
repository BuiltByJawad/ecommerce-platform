'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import useAxios from '@/context/axiosContext';

export interface PublicSystemSettings {
  website_name?: string;
  short_name?: string;
  tag_line?: string;
  logo_image?: string;
  fav_image?: string;
  copyright?: string;
}

interface SystemSettingsContextValue {
  settings: PublicSystemSettings | null;
  loading: boolean;
}

const SystemSettingsContext = createContext<SystemSettingsContextValue>({
  settings: null,
  loading: false,
});

export const useSystemSettings = () => useContext(SystemSettingsContext);

const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const { get } = useAxios();

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await get('/system-settings/public', {});
        const data = res?.data?.data?.settings || null;
        if (isMounted) {
          setSettings(data);
        }
      } catch {
        if (isMounted) {
          setSettings(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [get]);

  return (
    <SystemSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

export default SystemSettingsProvider;
