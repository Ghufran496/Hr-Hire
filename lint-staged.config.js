/** @type {import('lint-staged').Configuration} */
const config = {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{js,jsx,mjs,cjs,json,md,css}": ["prettier --write"],
};

export default config;
