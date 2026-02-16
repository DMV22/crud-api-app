
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/home",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/home"
  },
  {
    "renderMode": 2,
    "route": "/about"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-4F5X4EQK.js"
    ],
    "route": "/tasks"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-4F5X4EQK.js"
    ],
    "route": "/tasks/new"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-4F5X4EQK.js"
    ],
    "route": "/tasks/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-4F5X4EQK.js"
    ],
    "route": "/tasks/*/edit"
  },
  {
    "renderMode": 0,
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1002, hash: '974be668bbb396fdb1819a4321eabfba68cca5da0290032c13c4e5fd06d88ef8', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1008, hash: '5bf72858707331c1ccd5ddfac9b96fd0b78ee4b59e260ceb7d201d6b3da5bf05', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'about/index.html': {size: 4727, hash: '5019b77910418d9853dac3ec3546142860d2da4e13db1a8403ac0c124aeca1ba', text: () => import('./assets-chunks/about_index_html.mjs').then(m => m.default)},
    'home/index.html': {size: 7895, hash: '974984e3b08e464951b5f64a3c567c9aed00a651530c43e38bc7db8e53db4c5a', text: () => import('./assets-chunks/home_index_html.mjs').then(m => m.default)},
    'styles-DUTVRU2R.css': {size: 396, hash: '3VeyH7cMM/8', text: () => import('./assets-chunks/styles-DUTVRU2R_css.mjs').then(m => m.default)}
  },
};
