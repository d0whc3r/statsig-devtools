import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'https://api.statsig.com/openapi/20240601.json',
  output: {
    path: 'src/client',
    indexFile: false,
    tsConfigPath: 'tsconfig.app.json',
    case: 'camelCase',
    clean: true,
    format: 'prettier',
    lint: 'eslint',
  },
  plugins: [
    '@hey-api/typescript',
    {
      name: '@hey-api/client-fetch',
      runtimeConfigPath: './src/http-client.ts',
    },
    {
      asClass: true,
      name: '@hey-api/sdk',
    },
  ],
})
