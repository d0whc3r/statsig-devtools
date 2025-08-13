import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'https://api.statsig.com/openapi/20240601.json',
  output: 'src/client',
})
