import { SETTINGS_HELP, type SettingKey } from '../settingsHelp';

interface SettingHelpProps {
  settingKey: SettingKey;
}

export function SettingHelp({ settingKey }: SettingHelpProps) {
  const helpText = SETTINGS_HELP[settingKey];
  if (!helpText) return null;

  return (
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  );
}
