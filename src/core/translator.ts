import i18next, { InitOptions } from 'i18next';
import en from '../i18n/en.json';
import tr from '../i18n/tr.json';

const options: InitOptions = {
  resources: {
    en: { translation: en },
    tr: { translation: tr },
  },
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
};

void i18next.init(options).catch((error) => {
  console.error('Failed to initialize translations', error);
});

class Translator {
  translate(key: string, locale: string): string {
    const language = this.resolveLanguage(locale);
    return i18next.t(key, { lng: language, defaultValue: key });
  }

  private resolveLanguage(locale?: string): string {
    if (!locale) {
      return 'en';
    }

    const [lang] = locale.split('-');
    return lang ? lang.toLowerCase() : 'en';
  }
}

export const translator = new Translator();
export default translator;
