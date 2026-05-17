import { setRuntimeConfig } from '@/config/runtime';
import { applySeo } from './seo';

describe('applySeo', () => {
  afterEach(() => {
    delete window.__APP_CONFIG__;
    document.title = '';
  });

  it('supports API title templates using {title}', () => {
    setRuntimeConfig({
      app: {
        name: 'DIAP',
        slogan: 'Tecnologia Profesional',
      },
      seo: {
        titleTemplate: '{title} | DIAP',
        routes: {
          '/': {
            title: 'Inicio',
          },
        },
      },
    });

    applySeo({ pathname: '/' });

    expect(document.title).toBe('Inicio | DIAP');
  });
});
