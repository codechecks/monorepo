<p align="center">
  <a href="https://codechecks.io"><img src="./images/codechecks.png" width="600" alt="codechecks.io"></a>
  <h1 align="center">Code Checks</h1>
  <p align="center">
  Open source platform for code review automation ✅
  </p>
  <p align="center">
    <a href="https://circleci.com/gh/codechecks/monorepo"><img alt="Build Status" src="https://circleci.com/gh/codechecks/monorepo/tree/master.svg?style=svg"></a>
    <a href="/package.json"><img alt="Software License" src="https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square"></a>
    <img src="https://img.shields.io/badge/all_contributors-7-orange.svg?style=flat-square" alt="All Contributors">
    <a href="https://codechecks.io"><img src="https://raw.githubusercontent.com/codechecks/docs/master/images/badges/badge-default.svg?sanitize=true" alt="codechecks.io"></a>
  </p>
</p>

**CodeChecks.io** is a framework for code review automation. It allows writing plugins (codechecks) in **JavaScript**
that:

- execute directly on your **CI** (like CircleCI or TravisCI) and communicate with our backend
- can inspect all **Pull Request** data (title, content, changed files etc.)
- can attach feedback information back to **GitHub** as check (success/failure status, additional message)
- can upload, retrieve and calculate difference between arbitrary **artifacts** (like JSON values describing build size
  or screenshots of views of a frontend app)
- require only one **GitHub App** — [Codechecks App](https://github.com/apps/codechecks) installed in order to work

```typescript
import { codechecks } from "@codechecks/client";

export default async () => {
  await codechecks.success({
    name: "Hello world!",
    shortDescription: "It's so easy!",
    longDescription: "# Hello! 👋",
  });
};
```

![](images/demo.gif)

Particular codechecks can be distributed as **npm** packages and can be setup in a declarative way in
[`codechecks.yml`](https://github.com/codechecks/docs/blob/master/configuration.md#codechecksyml) file.

## Docs 📚

- [Awesome codechecks](https://github.com/codechecks/awesome-codechecks)
- [Getting started guide](https://github.com/codechecks/docs/blob/master/getting-started.md)
- [Full documentation](https://github.com/codechecks/docs)

## Packages 📦

| Package                                  | Version                                                                                                         | Description                                                |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [`@codechecks/client`](/packages/client) | [![npm](https://img.shields.io/npm/v/@codechecks/client.svg)](https://www.npmjs.com/package/@codechecks/client) | TypeScript/JavaScript client used for executing codechecks |

Note: Currently we are in the process of open sourcing whole platform.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!--Do not remove or modify this section -->-->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://twitter.com/krzkaczor"><img src="https://avatars2.githubusercontent.com/u/1814312?v=4" width="100px;" alt=""/><br /><sub><b>Chris Kaczor</b></sub></a><br /><a href="https://github.com/codechecks/monorepo/commits?author=krzkaczor" title="Code">💻</a> <a href="#ideas-krzkaczor" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/codechecks/monorepo/commits?author=krzkaczor" title="Documentation">📖</a> <a href="#business-krzkaczor" title="Business development">💼</a> <a href="#infra-krzkaczor" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://cgewecke.github.io/"><img src="https://avatars0.githubusercontent.com/u/7332026?v=4" width="100px;" alt=""/><br /><sub><b>cgewecke</b></sub></a><br /><a href="#plugin-cgewecke" title="Plugin/utility libraries">🔌</a> <a href="#ideas-cgewecke" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/codechecks/monorepo/commits?author=cgewecke" title="Code">💻</a></td>
    <td align="center"><a href="https://twitter.com/timocov_"><img src="https://avatars3.githubusercontent.com/u/3112183?v=4" width="100px;" alt=""/><br /><sub><b>Evgeniy Timokhov</b></sub></a><br /><a href="#plugin-timocov" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://michalzalecki.com"><img src="https://avatars1.githubusercontent.com/u/3136577?v=4" width="100px;" alt=""/><br /><sub><b>Michał Załęcki</b></sub></a><br /><a href="https://github.com/codechecks/monorepo/commits?author=MichalZalecki" title="Code">💻</a> <a href="#plugin-MichalZalecki" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="http://craigsworks.com"><img src="https://avatars0.githubusercontent.com/u/46025159?v=4" width="100px;" alt=""/><br /><sub><b>Craig Thompson</b></sub></a><br /><a href="https://github.com/codechecks/monorepo/commits?author=craigthompsonhive" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/ziolekjj"><img src="https://avatars2.githubusercontent.com/u/11246666?v=4" width="100px;" alt=""/><br /><sub><b>Jakub Ziółkowski</b></sub></a><br /><a href="https://github.com/codechecks/monorepo/commits?author=ziolekjj" title="Code">💻</a> <a href="#plugin-ziolekjj" title="Plugin/utility libraries">🔌</a></td>
    <td align="center"><a href="https://github.com/dericgw"><img src="https://avatars2.githubusercontent.com/u/34040106?v=4" width="100px;" alt=""/><br /><sub><b>Deric Cain</b></sub></a><br /><a href="https://github.com/codechecks/monorepo/commits?author=dericgw" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://www.seandawson.info"><img src="https://avatars1.githubusercontent.com/u/2357137?v=4" width="100px;" alt=""/><br /><sub><b>Sean Dawson</b></sub></a><br /><a href="#plugin-NoxHarmonium" title="Plugin/utility libraries">🔌</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification.
Contributions of any kind welcome! [Read more](./CONTRIBUTING.md)!
