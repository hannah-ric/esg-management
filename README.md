# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Deployment

This project provides container configurations for local development and for deployment on
[DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform).

### Local development

Use `docker-compose.debug.yml` to run the application with hot reloading:

```bash
docker compose -f docker-compose.debug.yml up --build
```

The app will be available on [http://localhost:3000](http://localhost:3000).

### Production container

To build the production image and run it locally:

```bash
docker compose up --build
```

The production container listens on port `8080` by default.

### DigitalOcean

The `.do/app.yaml` file defines the App Platform specification. Commit any changes
to this file and push to trigger a deployment.

### Running Tests

Unit tests are powered by [Vitest](https://vitest.dev). Execute the test suite with:

```bash
npm test
```
