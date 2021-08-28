# Identity App

Identity App to work with IdentityBox.

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

## Usage

```bash
$ yarn start [--clear]
```

> If you used the app before, and now your rendezvous server is available on a different url, make sure that you re-scan the QR-code published by the rendezvous server. This is especially important to do **before** you do a _factory reset_ in the Identity App.

## Publishing to TestFlight

> This documentation applies to Xcode v11.

### Update build/version number for the app

In `config.json` we have two attributes related to versioning of the app: `version` and `ios.buildNumber`. Before publishing the app to TestFlight one of the two needs to be updated. Currently we keep `version` fixed to `1.0.0`, and for each new build we just increase the build number.

> Here we are concerned with the iOS build, but notice that there is also attribute `android.versionCode` which plays the same role as `ios.buildNumber`. When increasing `ios.buildNumber` we also increase `android.versionCode`.

### Apply the build configuration

Run `yarn env:prod` from the terminal.

> All commands need to be run from the `workspaces/idapp` folder.

### Create iOS build

Run `expo build:ios` from the terminal. Once the build is finished download the corresponding `.ipa` file.

### Upload the build to Apple Connect

> Here I assume you have your Apple Connect configured. In particular you have generated an App Specific password for your account. If you need some guidance on the whole process you may like to consult [React Native: How To Publish An Expo App To TestFlight + Debug Common Errors] and the official Expo documentation [Uploading Apps to the Apple App Store and Google Play].

Once the app is built, download the `ipa` file and use [Apple Transporter](https://apps.apple.com/us/app/transporter/id1450874784?mt=12) to upload the file to the Apple Connect account.

## Previous (not recommended) method

In the past we had to use `xcrun` tool to upload the app to Apple Connect:

```bash
xcrun altool --upload-app -f <PATH-TO-IPA-FILE> -u <YOUR APPLE-ID>
```
  
You will be asked for the password.

> If you have 2FA enabled for your AppleId, you will need to create an App-specific password and provide it here.

It may take some time before the uploading of the app finishes. There will be no feedback or progress indication in the meantime. If everything worked out, you will just see `No errors uploading 'YOUR IPA FILE NAME'`. In case it did not work, you will get some information about the error, in which case [this thread](https://github.com/expo/expo-cli/issues/927) may help.

### Make your build ready on the Apple Connect portal

You may need to wait a bit before the processing of your build finishes on iTunes. You will get an email from iTunes Store saying that your new build has completed processing (and you will most probably ignore an email about ITMS-90809: Deprecated API Usage for UIWebView - we hope this will be fixed by Expo team soon).

You will also like to include additional information about your build so that your testers know what's new in this build that needs to be tested.

> We noticed that entering this description on Safari makes the portal unresponsive - Google Chrome worked just fine...


[React Native: How To Publish An Expo App To TestFlight + Debug Common Errors]: https://levelup.gitconnected.com/react-native-how-to-publish-an-expo-app-to-testflight-debug-common-errors-90e427b4b5ea

[Uploading Apps to the Apple App Store and Google Play]: https://docs.expo.io/versions/v35.0.0/distribution/uploading-apps/