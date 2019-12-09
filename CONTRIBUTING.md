# Contributing

> Working on your first Pull Request? You can learn how from this *free* series
> [How to Contribute to an Open Source Project on
> GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Quick start

After you clone your forked repo, follow the following steps to bootstrap your
local environment:

```bash
» yarn install
» yarn test
» (cd workspaces/homepage && yarn develop)
# or to get everything like in production
» now dev
```

## Code organization

Identity Box is a monorepo. It consists of a number of packages that all live under the `workspaces` folder. We use a combination of [lerna](https://lernajs.io) and [yarn
workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) to manage them.

### yarn install

We install all mono-repo dependencies with single top-level `yarn install` or just `yarn`. 

## Building packages

Because our monorepo contains a number of *packages* under the `workspaces` directory, some of them may need to be build before they can be published.
The build command uses `lerna` in order to trigger the build script
for every single workspace. Please use a convenience script `build` defined in the root `package.json`.

### Run tests

We run all the tests from the top level - this is far more efficient 
especially if the number of workspaces in the monorepo increases:

```bash
» yarn test
» yarn test --no-cache    // good to know this
» yarn jest --clearCache  // a nice one
```

### Confluenza-based homepage

This is our landing page. It uses [Confluenza](https://confluenza.online), which is based on [Gatsby](https://www.gatsbyjs.org/).

To start development server or to build version that is ready for distribution you can run:

```bash
» cd workspaces/homepage
» yarn develop
» yarn build
```

## Using now dev

Take advantage of `now dev` to run a development server and have a mirror of your production hot-reloading. Read more at [Introducing `now dev` – Serverless, on localhost](https://zeit.co/blog/now-dev).

## Babel 7

We use Babel 7.

Babel 7 has changed in how babel configuration is discovered.

It allows three different configuration files: `babel.config.js`,
`.babelrc.js`, and the familiar `.babelrc`. The semantics of file 
discovery have changed. If `babel.config.js` is present at your 
current working directory, only this file will be used and `.babelrc` 
and `.babelrc.js` will be ignored (and it does not matter if they are 
in your `cwd` or in one of the subfolders).

If `babel.config.js` is not present, you can decide to either use 
`.babelrc` for static configuration or `.babelrc.js` if you prefer to 
programmatically create your configuration. If you use the `.babelrc` variant, please notice that Babel 7 will look for a `.babelrc` in the current directory. If Babel finds
other `.babelrc` files while transpiling files in a subfolder, it will merge the configurations together.

Because our packages share the same Babel configuration, we chose
to create a single top-level `babel.config.js` where we can 
programmatically create the configuration based on the `BABEL_ENV` and 
`NODE_ENV` environment variables. The same configuration file is used 
to run jest tests.

We could not avoid having babel configurations in subfolders because 
the babel 7 does not continue searching above the first `package.json` that it finds, and we run the `yarn build` command for the packages via top-level `yarn lerna run build`, which means it will be executed from the package folder. 

Fortunately, we are able to reuse the top-level
`babel.config.js` by having the package-specific `babel.config.js` 
with just the following content:

```javascript
module.exports = {
  extends: '../../babel.config.js'
}
```

Alternatively, you can also use `.babelrc.js` with the following content:

```javascript
const babelConfig = require('../../babel.config')

module.exports = babelConfig
```

> In this case, make sure that you do not use the `--no-babelrc`
option in any of the babel commands in the `tools/build.js` top-level
script.


So to summarize, we have a top-level `babel.config.js` and then for each package that we intend to publish to npm registry or which needs a custom babel configuration we have a `babel.config.js` file in the corresponding workspace directory.

> Please notice that we run tests from the top-running of the tests is nicely handled by the top-level `babel.config.js`.

## Staying in sync with upstream

You can follow the steps described in [Syncing a
fork](https://help.github.com/articles/syncing-a-fork/). We recommend that you
keep your local master branch pointing to the upstream master branch. Remaining
in sync then becomes really easy:

```bash
git remote add upstream https://github.com/marcinczenko/identity-box.git
git fetch upstream
git branch --set-upstream-to=upstream/master master
```

Now, when you do `git pull` from your local `master` branch git will 
fetch changes from the `upstream` remote. Then you can make all of 
your pull request branches based on this `master` branch.

## Submitting a Pull Request

Please go through existing issues and pull requests to check if 
somebody else is already working on it, we use `someone working on it` 
label to mark such issues.

## Read more

In order to get a better grip on Babel 7 and how does it handle configuration files in version 7,
please refer to the following documents:

1. [Configure Babel](https://babeljs.io/docs/en/configuration)
2. [Config Files](https://babeljs.io/docs/en/config-files)
