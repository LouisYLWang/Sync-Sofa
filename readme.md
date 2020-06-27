
<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Sync Sofa - streaming video playback synchronizer extension](#sync-sofa-streaming-video-playback-synchronizer-extension)
  - [Installation](#installation)
    - [Chrome / Chromium](#chrome-chromium)
      - [Install from Chrome Web Store](#install-from-chrome-web-store)
      - [Install from local .crx file](#install-from-local-crx-file)
      - [Install from unpackaged folder](#install-from-unpackaged-folder)
    - [Microsoft Edge:](#microsoft-edge)
      - [Install from Microsoft Edge Addons](#install-from-microsoft-edge-addons)
    - [Firefox (will be supported in later version)](#firefox-will-be-supported-in-later-version)
  - [Usage](#usage)
    - [Open a video page](#open-a-video-page)
    - [Request new code](#request-new-code)
    - [Start connection](#start-connection)
    - [Enjoy yourselves](#enjoy-yourselves)
  - [Installation](#installation-1)
    - [Self-hosting server](#self-hosting-server)
      - [🐳 With Docker :](#with-docker)
        - [web host](#web-host)
        - [local host (dev env)](#local-host-dev-env)
      - [Without Docker:](#without-docker)
    - [Install extension client:](#install-extension-client)
  - [Release History](#release-history)
  - [Meta](#meta)
  - [Contributing](#contributing)

<!-- /code_chunk_output -->

# Sync Sofa - streaming video playback synchronizer extension

> This chrome extension allows multi-user sync streaming video in a fast, simple and stable way.

![GitHub go.mod Go version (subfolder of monorepo)](https://img.shields.io/github/go-mod/go-version/LouisYLWang/Sync-Sofa?filename=server%2Fgo.mod&style=flat-square) [![Chrome web store users][chrome-image]][chrome-url]

Sync Sofa is a full stack web extension support a easy-to-use and stable way to synchronize streaming playback for multiple users. It can improve the experience when users from different locations want to share a video/movie remotely. Currently the feartures include:

- 2 party connection: either party can be the host of a sync room and the other can join with connection code.
- sync pause/play: each user pause/play the video, the other side will do the same
- sync play process bar control: the playing time change will also affect other side user
- out-of-sync notification: if any party disconnected/left the room, the other user will be notified.

## Installation

### Chrome / Chromium

#### Install from Chrome Web Store

1. Open [Sync Sofa - Online Video Synchronizer - Chrome Web Store](https://chrome.google.com/webstore/detail/sync-sofa-online-video-sy/kgpnhgmpijhpkefpddoehhminpfiddmg) in your Chrome
2. Click `Add to Chrome` button
3. Choose `Add extension`

#### Install from local .crx file

1. Open [Github release page](https://github.com/LouisYLWang/Sync-Sofa/releases/latest)
2. Download `sync_sofa.[version].crx`, *[version]* is the number of latest version 
3. Open `chrome://extensions/` in your Chrome
4. Turn on `Developer mode` (in the top right corner)
5. Drag `sync_sofa.[version].crx` into the `chrome://extensions/` page
6. Choose `Add extension`

**Notices**: 
If the extension is disabled by Chrome, try [Install from chrome web store](#install-from-chrome-web-store) or [Install from unpackaged folder](#install-from-unpackaged-folder).
> This extension is not listed in the Chrome Web Store and may have been added without your knowledge.

#### Install from unpackaged folder

1. Download [stable version](https://github.com/LouisYLWang/Sync-Sofa/archive/master.zip) or [development version](https://github.com/LouisYLWang/Sync-Sofa/archive/dev.zip) (with new features and some bugs maybe)
2. Unzip the `.zip` file you downloaded
3. Open `chrome://extensions/` in your Chrome
4. Turn on `Developer mode` (in the top right corner)
5. Click `Load unpacked` (in the top left corner)
6. Choose `[download_path]/[unzip folder]/client/chrome_extension`
7. Click `select`

### Microsoft Edge:

#### Install from Microsoft Edge Addons

1. Open [Sync Sofa - Online Video Synchronizer - Microsoft Edge Addons](https://microsoftedge.microsoft.com/addons/detail/kpfbclpafmmjalikjjlcoddffpfgghgp) in your Microsoft Edge
2. Click `Get` button

### Firefox (will be supported in later version)

## Usage

**Notices⚠️⚠️⚠️**: 

1. Before use, please make sure the version number of two clients are consistent. 
2. If you want to play local `.mp4` file, please enable `Allow access to file URLs` in extension details page, for example, `chrome://extensions/?id=djhbgkadejdmihbngglpnogjookpadjl` in Chrome.
3. If there are multiple versions of extensions in your browser, please enable one and disable others.

### Open a video page

you two don't have to open the same webpage, you play the video via local `.mp4` file and your partner watch it one some video websites, is ok as long as you both watch the same video actually (source providers are different). 

In this doc, for example, `User A` will watch the video on Bilibili and `User B` will do it on Youtube. Here is the webpage:

* [https://www.bilibili.com/video/BV1k5411Y7Rc](https://www.bilibili.com/video/BV1k5411Y7Rc)
* [https://www.youtube.com/watch?v=QAelMP1PoNA](https://www.youtube.com/watch?v=QAelMP1PoNA)

![User A](https://onns.xyz/blog/image/20200627-1.png)
![User B](https://onns.xyz/blog/image/20200627-2.png)

If there are any ads before the video, watch them before the next step.

### Request new code

Click the `Sync Sofa` extension and then click `REQUEST NEW CODE` button.

![User A](https://onns.xyz/blog/image/20200627-3.png)

If nothing goes wrong you will receive a message like `Room created and room code copied to clipboard`, and the `room code` has been copied to your clipboard, send it to your partner.

### Start connection

Your partner receive the `room code`, click the `Sync Sofa` extension, paste it in the input area and click `START` button.

![User B](https://onns.xyz/blog/image/20200627-4.png)

### Enjoy yourselves

![User A](https://onns.xyz/blog/image/20200627-5.png)
![User B](https://onns.xyz/blog/image/20200627-6.png)

Now you can play the video, your operation will be synced to your partner. Enjoy yourselves!

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
