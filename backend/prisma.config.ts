import { defineConfig } from 'prisma';

export default defineConfig({
  datasource: {
    provider: 'sqlite',
    url: 'file:./dev.db', // Your database file path goes here
  },
});