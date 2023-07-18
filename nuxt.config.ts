const {
  NUXT_PUBLIC_APP_NAME,
  NODE_ENV,
  SSR,
  DEFAULT_LOCALE,
} = process.env

const appName = NUXT_PUBLIC_APP_NAME ?? 'ChatGPT UI'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  debug: NODE_ENV !== 'production',
  ssr: SSR !== 'false',
  app: {
    head: {
      title: appName,
    },
  },
  runtimeConfig: {
    public: {
      appName,
      typewriter: false,
      typewriterDelay: 50,
      customApiKey: false
    }
  },
  build: {
    transpile: ['vuetify']
  },
  css: [
    'vuetify/styles',
    'material-design-icons-iconfont/dist/material-design-icons.css',
    'highlight.js/styles/panda-syntax-dark.css',
  ],
  modules: [
    '@kevinmarrec/nuxt-pwa',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n'
  ],
  pwa: {
    manifest: {
      name: appName,
      short_name: appName,
      description: 'A ChatGPT web Client',
      lang: `en`,
      start_url: `/`,
      display: `fullscreen`,
      background_color: `#ffffff`,
      theme_color: `#ffffff`,
      icons: [],
    },
  },
  i18n: {
    strategy: 'no_prefix',
    locales: [
      {code: 'en', iso: 'en-US', name: 'English', file: 'en-US.json'},
      {code: 'zh-CN', iso: 'zh-CN', name: '简体中文', file: 'zh-CN.json'},
      {code: 'ru', iso: 'ru-RU', name: 'Русский', file: 'ru-RU.json'},
      {code: 'fr', iso: 'fr-FR', name: 'Français', file: 'fr-FR.json'},
      {code: 'es', iso: 'es-ES', name: 'Español', file: 'es-ES.json'}
    ],
    lazy: true,
    langDir: 'lang',
    defaultLocale: DEFAULT_LOCALE || 'en',
    vueI18n: {
      fallbackLocale: 'en',
    },
  }
})
