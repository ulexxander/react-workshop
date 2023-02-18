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

- [Docker: Accelerated, Containerized Application Development](https://www.docker.com/)
- [Node.js](https://nodejs.org/en/) - LTS recommended, `18.14.1` at the moment of writing this.
- [Yarn - Package Manager](https://yarnpkg.com/) - alternative to NPM.
- [React Native development environment](https://reactnative.dev/docs/environment-setup)

## Backend

Located under `backend` directory.

Simple REST API example with a single resource:

```
GET /notes
GET /notes/{id}
POST /notes
```

### Usage

```sh
# Go to project directory.
cd backend
```

```sh
# Optionally run locally, requires Go SDK installed.
go run main.go -addr=:4000
```

```sh
# Build Docker image.
docker build -t react-workshop-backend .
```

```sh
# Run as a Docker container with port forwarded to 4000 on host.
docker run --rm -it -p 4000:80 react-workshop-backend
```

## React DOM

[ReactDOM – React](https://reactjs.org/docs/react-dom.html)

Most common way of running React - in the browser.

Located under `web` directory.

Was bootstrapped with `yarn create vite` command, but you don't have to run it.

### Usage

Ensure [Backend](#backend) is set up and running.

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
# Run as a Docker container, with port forwarded to 4010 on host, app being served by Nginx.
docker run --rm -it -p 4010:80 react-workshop-web
```

## React Native

[React Native · Learn once, write anywhere](https://reactnative.dev/)

Building cross platform (Android, IOS) mobile apps with React.

Located under `mobile` directory.

Was bootstrapped with `npx react-native init ReactWorkshop` command, but you don't have to run it.

### Usage

```sh
# Go to project directory.
cd mobile
```

```sh
# Install dependencies.
yarn
```

```sh
# Start React Native bundler.
yarn start
```

```sh
# Build and run app on Android.
# Requires either physical or virtual device that can be accessed via ADB.
yarn android
```

```sh
# Build APK for Android.
yarn build-apk
# android/app/build/outputs/apk/release/app-release.apk
```

```sh
# Build AAB for Android (Play Store).
yarn build-aab
# mobile/android/app/build/outputs/bundle/release/app-release.aab
```
