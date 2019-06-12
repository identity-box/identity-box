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
» now dev
```

## Code organization

Identity Box is a monorepo. It consists of a number of packages that all live under the `workspaces` folder. We use a combination of [lerna](https://lernajs.io) and [yarn
workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) to manage them.

### yarn install

We install all mono-repo dependencies with single top-level `yarn install` or just `yarn`. 

### Build packages

Building packages is no longer necessary. We use [esm](https://www.npmjs.com/package/esm): a babel-less, bundle-less ECMAScript module loader.

### Run tests

We run all the tests from the top level - this is far more efficient 
especially if the number of workspaces in the monorepo increases:

```bash
» yarn test
» yarn test --no-cache    // good to know this
» yarn jest --clearCache  // a nice one
```

### Confluenza-based homepage

This is our landing page. It uses [Confluenza](https://confluenza.now.sh), which is based on [Gatsby](https://www.gatsbyjs.org/).

To start development server or to build version that is ready for distribution you can run:

```bash
» cd workspaces/homepage
» yarn develop
» yarn build
```

## Using now dev

Take advantage of `now dev` to run a development server and have a mirror of your production hot-reloading. Read more at [Introducing `now dev` – Serverless, on localhost](https://zeit.co/blog/now-dev).

## Babel 7

We use Babel 7 transpiler only to run tests as long as jest does not support [esm](https://www.npmjs.com/package/esm).

Only one, top-level `babel.config.js` is sufficient to enable proper transpilation for `jest`.

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
