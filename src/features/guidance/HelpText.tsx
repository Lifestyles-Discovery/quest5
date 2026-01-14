import { FIELD_HELP, type FieldHelpKey } from './fieldHelp';

interface FieldHelpProps {
  helpKey: FieldHelpKey;
  show: boolean;
}

export function FieldHelp({ helpKey, show }: FieldHelpProps) {
  if (!show) return null;

  const helpText = FIELD_HELP[helpKey];
  if (!helpText) return null;

  return (
    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helpText}</p>
  );
}
