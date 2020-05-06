# Sync Sofa - streaming video playback synchronizer extension

> This chrome extension allows multi-user sync streaming video in a fast, simple and stable way.

![GitHub go.mod Go version (subfolder of monorepo)](https://img.shields.io/github/go-mod/go-version/LouisYLWang/Sync-Sofa?filename=server%2Fgo.mod&style=flat-square)
[![Chrome web store users][chrome-image]][chrome-url]

Sync Sofa is a full stack web extension support a easy-to-use and stable way to synchronize streaming playback for multiple users. It can improve the experience when users from different locations want to share a video/movie remotely. Currently the feartures include:

- 2 party connection: either party can be the host of a sync room and the other can join with connection code.
- sync pause/play: each user pause/play the video, the other side will do the same
- sync play process bar control: the playing time change will also affect other side user
- out-of-sync notification: if any party disconnected/left the room, the other user will be notified.

## Installation

### Self-hosting server

#### 🐳 With Docker :

##### web host

Before hosting, make sure your server can communicate securely with HTTPS and link to an domian name. The deploy script only support Let's Encrypt certificates, you can customized with your own SSL certificate providers.

```sh
./server/deploy.sh {your host name}
```

##### local host (dev env)

checkout to branch localdev and refer to this doc:

https://github.com/LouisYLWang/Sync-Sofa/blob/localdev/README.md

#### Without Docker:

```sh
go get github.com/LouisYLWang/Sync-Sofa/server

cd $GOPATH/src/github.com/LouisYLWang/Sync-Sofa/server
go install
cd $GOPATH/bin

# set environment variables
export ADDR={your port}
export TLSKEY={your ssl certificate key file location}
export TLSCERT={your ssl ssl certificate file location}
./server(.exe if you are using windows)
```

### Install extension client:

🌐 Chrome / Chromium:

Download from Chrome web store:

https://chrome.google.com/webstore/detail/sync-sofa-beta-online-vid/kgpnhgmpijhpkefpddoehhminpfiddmg

Download from mirror web store:

https://pictureknow.com/extension?id=917ffc6701324f708c148e9249252eec

Install .crx (drag the file into browser):i

https://github.com/LouisYLWang/Sync-Sofa/releases/download

🌐 Edge: (will be supported in later version)

🦊 Firefox: (will be supported in later version)

## Release History

- 1.0.2
  - support play process bar control sync
  - fixed the issue that when syncing playing time, there is the possibility to crash the extension

* 0.0.1 (beta version)
  - 2 party connection
  - sync pause and play action
  - out-of-sync notification

## Meta

Yiliang "Louis" Wang – [@myblog](https://ylwang.codes/) – louis.yl.wang@outlook.com

## Contributing

1. Fork it (<https://github.com/LouisYLWang/Sync-Sofa/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

<!-- Markdown link & img dfn's -->

[chrome-image]: https://img.shields.io/chrome-web-store/users/kgpnhgmpijhpkefpddoehhminpfiddmg?style=flat-square
[chrome-url]: https://chrome.google.com/webstore/detail/sync-sofa-beta-online-vid/kgpnhgmpijhpkefpddoehhminpfiddmg
