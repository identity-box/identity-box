# Identity App

Identity App to work with IdentityBox.

## App configuration

The telepath channel description for the app comes from one of the config files.
Before starting the app, please make sure to create a valid config file
with the channel data that you want to use. Please
take a look at one of the existing configuration files (`*.config.js`).
All the constants from the config file will be added to `app.json`
under the `extra` key. The `app.json` is created by adding this
`extra` key to the contents of the `config.json`.
Therefore before running `yarn expo start` or any other expo command,
please make sure you select the correct configuration by
running `expo-env --env=<your-configuration>`. This will properly
populate the `extra` entry of the `app.json` making it visible
to the app via `Constants.manifest.extra`.
For more information check [expo-env](https://www.npmjs.com/package/expo-env).

## Usage

```
$ expo-env --env=<your-configuration>
$ yarn start [--clear]
```
