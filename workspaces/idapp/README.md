# Identity App

Identity App to work with Identity Box. It is built with [Expo](https://expo.dev), current SDK is `SDK 45`.

## App configuration

The app does not currently require any configuration.

> In case one is needed in the future, it can be provided in one of the configuration files (`*.config.js`).
All the constants from the config file will be added to `app.json`
under the `extra` key. The `app.json` is created by adding this
`extra` key to the contents of the `config.json`.
Therefore before running `yarn expo start` or any other expo command,
please make sure you select the correct configuration by
running `expo-env --env=<your-configuration>`. This will properly
populate the `extra` entry of the `app.json` making it visible
to the app via `Constants.manifest.extra`.
For more information check [expo-env](https://www.npmjs.com/package/expo-env).

## Preparing for distribution

Below the steps to prepare the app for distribution.
### Update build/version number for the app

In `config.json` we have two attributes related to versioning of the app: `version` and `ios.buildNumber`. Before publishing the app to TestFlight one of the two needs to be updated. Currently we keep `version` fixed to `1.0.0`, and for each new build we just increase the build number.

> Here we are concerned with the iOS build, but notice that there is also attribute `android.versionCode` which plays the same role as `ios.buildNumber`. When increasing `ios.buildNumber` we also increase `android.versionCode`.

### Apply the build configuration

Run `yarn env:prod` from the terminal.

> All commands need to be run from the `workspaces/idapp` folder.

> Remember to issue `yarn build` at the root of the repo to build all dependencies. In the future we will move the whole build to the CI, but for know this has to be locally on your machine. This is not really needed you build on EAS server, as we make sure that local packages are build automatically there (see `postinstall` script in the root `package.json`).

## Expo EAS

With `SDK 45`, expo introduced [Expo Application Services](https://expo.dev/eas). It is a serious improvement over previous `expo-cli`, which significantly improve developer experience when working with Expo.

In what follows we show how to work with Expo and Identity App using the newly introduced Expo tools.

Expo comes with two CLI tools: `expo-cli` and `eas-cli`. `expo-cli` we already know, this is how we _used to_ work with expo using `expo start --ios` and `expo build:ios`. The output was an `ipa` file we could submit to App Store using [Apple Transporter](https://apps.apple.com/us/app/transporter/id1450874784?mt=12).

> There is also a [New Versioned Expo CLI](https://blog.expo.dev/new-versioned-expo-cli-cf6e10632656). Thus, something new to play with.

We leave a summary of the legacy instructions below for the reference.

> Notice that [2022 is the final year the Classic Build service will be available](https://blog.expo.dev/turtle-goes-out-to-sea-d334db2a6b60). It is time to switch to EAS.

When developing Expo applications we use [Expo Go](https://expo.dev/client) - a free app to launch your app on an iOS or Android device. With EAS, we can still use Expo Go, but we can also something called [development builds](https://docs.expo.dev/development/build/). In short, using development builds, we can create our own version of [Expo Go](https://expo.dev/client) app, specially crafted for our project and containing only relevant native modules. Having a development build installed on the device, you can then conveniently develop as when you used the Expo Go app before. Expo Go is just replaced by your own app.

## How to create a development build

[Expo documentation](https://docs.expo.dev/development/build/) is pretty exhaustive, so here just a summary and some observations.

You can either create the development build on the EAS server (up the free tier, after which you will need to pay) or your own local xcode distribution. The command to build a development build app on the eas server is (here, we focus on ios):

```bash
eas build --profile development --platform ios
```
The same to build and install app on your local machine:

```bash
expo run:ios -d
```

> In both cases you may need to register your devices with your account first using `eas device:create`, see the documentation for the details.

Now to develop the app that is already installed on your device, just do:

```bash
$ expo start --dev-client [--clear]
```

> If you used the app before, and now your rendezvous server is available on a different url, make sure that you re-scan the QR-code published by the rendezvous server. This is especially important to do **before** you do a _factory reset_ in the Identity App.

## Internal Distribution

Before submitting to the App Store (also TestFlight), you may also build a production version of your app without development extensions - this way you can test the app locally before going through the App Store publishing cycle:

```bash
# on the server
eas build --profile preview --platform ios

# locally
expo run:ios --configuration Release -d
```

The production build to my best knowledge can only be done on the server:

```bash
eas build --profile production --platform ios
```

## Submitting the app

Finally, the app submission with `eas submit` seems to be working just fine. If in trouble though, you can still just download the production build from EAS server and submit the app using [Apple Transporter](https://apps.apple.com/us/app/transporter/id1450874784?mt=12).

To submit the production build using EAS url:

```bash
eas submit --url <url>
```

To submit a previously downloaded production build:

```bash
eas submit --platform ios
```

## Troubleshooting

In our overall experience we observed the following:

1. When building on local computer using `expo run:ios -d`: if the build fails, try the following:

  ```bash
  rm -rf ~/Library/Developer/Xcode/DerivedData/*
  rm -rf **/node_modules
  yarn install
  yarn build
  ```

2. We recommend installing `expo-cli` and `eas-cli` globally (e.g. `yarn global add expo-cli eas-cli`).
3. When building on the server, pay attention on `.gitignore`. `eas  build` will only upload to eas server what is not ignored.
4. `eas build` operates on your repo in the same way you do locally. Before the expo app can be built, local dependencies need to be built. This is why we have `posinstall` scrip in the top-level `package.json`.


## Legacy instruction for the reference

For the reference, we still keep the original build steps below.

### Usage

```bash
$ yarn start [--clear]
```

> If you used the app before, and now your rendezvous server is available on a different url, make sure that you re-scan the QR-code published by the rendezvous server. This is especially important to do **before** you do a _factory reset_ in the Identity App.
### Update build/version number for the app

In `config.json` we have two attributes related to versioning of the app: `version` and `ios.buildNumber`. Before publishing the app to TestFlight one of the two needs to be updated. Currently we keep `version` fixed to `1.0.0`, and for each new build we just increase the build number.

> Here we are concerned with the iOS build, but notice that there is also attribute `android.versionCode` which plays the same role as `ios.buildNumber`. When increasing `ios.buildNumber` we also increase `android.versionCode`.

### Apply the build configuration

Run `yarn env:prod` from the terminal.

> All commands need to be run from the `workspaces/idapp` folder.

> Remember to issue `yarn build` at the root of the repo to build all dependencies. In the future we will move the whole build to the CI, but for know this has to be locally on your machine. This is not really needed you build on EAS server, as we make sure that local packages are build automatically there (see `postinstall` script in the root `package.json`).
### Create iOS build

Run `expo build:ios` from the terminal. Once the build is finished download the corresponding `.ipa` file.
### Upload the build to Apple Connect

Once the app is built, download the `ipa` file and use [Apple Transporter](https://apps.apple.com/us/app/transporter/id1450874784?mt=12) to upload the file to the Apple Connect account.

### Previous (not recommended) method

In the past we had to use `xcrun` tool to upload the app to Apple Connect:

```bash
xcrun altool --upload-app -f <PATH-TO-IPA-FILE> -u <YOUR APPLE-ID>
```

You will be asked for the password.

> Here I assume you have your Apple Connect configured. In particular you might have to generate an App Specific password for your account. If you need some guidance on the whole process you may like to consult [React Native: How To Publish An Expo App To TestFlight + Debug Common Errors] and the official Expo documentation [Uploading Apps to the Apple App Store and Google Play].
  

> If you have 2FA enabled for your AppleId, you will need to create an App-specific password and provide it here.

It may take some time before the uploading of the app finishes. There will be no feedback or progress indication in the meantime. If everything worked out, you will just see `No errors uploading 'YOUR IPA FILE NAME'`. In case it did not work, you will get some information about the error, in which case [this thread](https://github.com/expo/expo-cli/issues/927) may help.

### Make your build ready on the Apple Connect portal

You may need to wait a bit before the processing of your build finishes on iTunes. You will get an email from iTunes Store saying that your new build has completed processing (and you will most probably ignore an email about ITMS-90809: Deprecated API Usage for UIWebView - we hope this will be fixed by Expo team soon).

You will also like to include additional information about your build so that your testers know what's new in this build that needs to be tested.

> We noticed that entering this description on Safari makes the portal unresponsive - Google Chrome worked just fine...


[React Native: How To Publish An Expo App To TestFlight + Debug Common Errors]: https://levelup.gitconnected.com/react-native-how-to-publish-an-expo-app-to-testflight-debug-common-errors-90e427b4b5ea

[Uploading Apps to the Apple App Store and Google Play]: https://docs.expo.io/versions/v35.0.0/distribution/uploading-apps/