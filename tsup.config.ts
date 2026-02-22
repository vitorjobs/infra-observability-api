import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/scripts/**'],
  outDir: 'build',
  format: ['esm'],
  target: 'es2020',
  clean: true,
  dts: false,         // Ative se quiser gerar arquivos .d.ts (definições)
  splitting: false,   // Ative se usar import dinâmico
  sourcemap: true,    // Útil para debug em produção
  external: ['dotenv'], // 👈 evita empacotar o dotenv no bundle
})
