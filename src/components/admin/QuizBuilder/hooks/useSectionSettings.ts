import { useState } from 'react';

export const useSectionSettings = (initialSettings) => {
  const [settings, setSettings] = useState(initialSettings);

  const updateSetting = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return [settings, updateSetting];
};