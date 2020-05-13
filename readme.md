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

**Notices**: 
Before use, please double check the version number of two clients are consistent. If the client are in same version.


🌐 Chrome / Chromium:

Download from Chrome web store:

https://chrome.google.com/webstore/detail/sync-sofa-beta-online-vid/kgpnhgmpijhpkefpddoehhminpfiddmg

Download from mirror web store:

https://pictureknow.com/extension?id=917ffc6701324f708c148e9249252eec

Install .crx (drag the file into browser):

https://github.com/LouisYLWang/Sync-Sofa/releases/download

🌐 Edge: 

https://microsoftedge.microsoft.com/addons/detail/kpfbclpafmmjalikjjlcoddffpfgghgp

🦊 Firefox: (will be supported in later version)

## Release History

🛠 update on 12 May 2020 - v 1.0.5
------------------------------------------------------------------------------------
Improve stability
  > Test for a new logic to avoid infinite echo back (each party repeat the last operation of other party) : introduce a queue as a buffer of operation and if the operations is beyond frequency threshold, the client will automatically to halt and cool down for sometime.

Add support for edge browser (beta)


🛠 update on 10 May 2020 - v 1.0.4
------------------------------------------------------------------------------------
Now user will get notification when they successfully connected to each other
Improve stability, better sync performance
Change the notification UI using sweetalert

🛠 update on 8 May 2020 - v 1.0.3
------------------------------------------------------------------------------------
improve stability & UX logic
Added support of following websites:
  - [iqiyi](https://www.iqiyi.com/) 
  - [youku](https://www.youku.com/)
  - [weiyun](https://www.weiyun.com/)
  - [tencent video](https://v.qq.com/)

Fixed the support of duonao live;
Removed the support of 91mjw (temporarily);
Refined documentation, will add more detail in next verison;

🛠 update on 31 Mar 2020 - 1.0.2
------------------------------------------------------------------------------------
Add support of play process bar control sync
Fixed the issue that when syncing playing time, there is the possibility to crash the extension


🛠 update on 26 Mar 2020 - 0.0.1 (beta version)
------------------------------------------------------------------------------------
Add support of 2 parties connection
Add support of sync pause and play action
Add support of out-of-sync notification


## Meta

Yiliang "Louis" Wang – [@blog](https://ylwang.codes/) – [@mail](mailto://louis.yl.wang@outlook.com)

Onns – [@blog](https://onns.xyz/) – [@mail](mailto://onns@onns.xyz)

## Contributing

1. Fork it (<https://github.com/LouisYLWang/Sync-Sofa/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

<!-- Markdown link & img dfn's -->

[chrome-image]: https://img.shields.io/chrome-web-store/users/kgpnhgmpijhpkefpddoehhminpfiddmg?style=flat-square
[chrome-url]: https://chrome.google.com/webstore/detail/sync-sofa-beta-online-vid/kgpnhgmpijhpkefpddoehhminpfiddmg
