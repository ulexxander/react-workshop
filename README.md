# React Workshop

[React – A JavaScript library for building user interfaces](https://reactjs.org/)

Practical example of using React for those who learn it.

React helps with:

- Building declarative user-interfaces
- Managing application state
- Writing maintainable code
- Iterating faster
- Delivering good user experience
- Reusing code
- Developing application for many platforms: web, mobile, desktop

## Requirements

- [Node.js](https://nodejs.org/en/) - LTS recommended, `18.14.1` at the moment of writing this.
- [Yarn - Package Manager](https://yarnpkg.com/) - alternative to NPM.

## React DOM

[ReactDOM – React](https://reactjs.org/docs/react-dom.html)

Most common way of running React - in the browser.

Located under `web` directory.

Was bootstrapped with `yarn create vite` command, but you don't have to run it.

### Usage

```sh
# Go to project directory.
cd web
```

```sh
# Install dependencies.
yarn
```

```sh
# Start development server.
yarn dev
```

```sh
# Build Docker image.
docker build -t react-workshop-web .
```

```sh
# Run as a Docker container, app being served by Nginx.
docker run --rm -it -p 4000:80 react-workshop-web
```

## React Native

[React Native · Learn once, write anywhere](https://reactnative.dev/)

TODO.
