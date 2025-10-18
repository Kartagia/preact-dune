var typeScriptVersion = '5.8.3';

System.config({
  transpiler: 'ts',
  typescriptOptions: {
  },
  packages: {
    ".": {
      main: './main.ts',
      defaultExtension: 'ts'
    }
  },
  meta: {
    'typescript': { 'exports': 'ts' }
  },
  paths: {
    'npm:': 'https://unpkg.com/'
  },
  map: {
    'ts': 'npm:plugin-typescript@8.0.0/lib/plugin.js',
    'typescript': 'npm:typescript@' + typeScriptVersion + '/lib/typescript.js',
    'preact':'npm:htm@3.1.1/preact/standalone.umd.js',
    'preact/compat':'npm:preact@10.27.2/compat/client.js',
  }
});

System.import('./main')
  .catch(console.error.bind(console));
