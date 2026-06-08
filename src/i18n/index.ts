import fr from './fr';
import en from './en';

const dictionaries = { fr, en };

export type Language = keyof typeof dictionaries;

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let current: Record<string, unknown> | string = dictionaries[lang] as unknown as Record<string, unknown>;

  for (const k of keys) {
    if (typeof current === 'object' && current !== null && k in current) {
      current = (current as Record<string, unknown>)[k] as Record<string, unknown> | string;
    } else {
      console.warn(`Translation key not found: ${key} for lang: ${lang}`);
      return key;
    }
  }

  return current as string;
}
