# Sync Sofa - streaming video playback synchronizer extension

> This chrome extension allows multi-user sync streaming video in a fast, simple and stable way.

![GitHub go.mod Go version (subfolder of monorepo)](https://img.shields.io/github/go-mod/go-version/LouisYLWang/Sync-Sofa?filename=server%2Fgo.mod&style=flat-square) [![Chrome web store users][chrome-image]][chrome-url]

Sync Sofa is a full stack web extension support a easy-to-use and stable way to synchronize streaming playback for multiple users. It can improve the experience when users from different locations want to share a video/movie remotely. Currently, the feartures include:

- 2 party connection: either party can be the host of a sync room and the other can join with connection code.
- sync pause/play: each user pause/play the video, the other side will do the same
- sync play process bar control: the playing time change will also affect other side user
- out-of-sync notification: if any party disconnected/left the room, the other user will be notified.

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Sync Sofa - streaming video playback synchronizer extension](#sync-sofa-streaming-video-playback-synchronizer-extension)
  - [Supported list](#supported-list)
  - [Setting](#setting)
    - [Server list](#server-list)
    - [Options page](#options-page)
    - [Refresh video page](#refresh-video-page)
  - [Usage](#usage)
    - [Notices](#notices)
    - [Open a video page](#open-a-video-page)
    - [Request new code](#request-new-code)
    - [Start connection](#start-connection)
    - [Enjoy yourselves](#enjoy-yourselves)
  - [VLC support](#vlc-support)
    - [Start VLC on the server with the Web Interface](#start-vlc-on-the-server-with-the-web-interface)
    - [Request new code](#request-new-code-1)
    - [Start connection](#start-connection-1)
    - [Enjoy yourselves](#enjoy-yourselves-1)
    - [Close Controller webpage](#close-controller-webpage)
  - [Installation](#installation)
    - [Google Chrome](#google-chrome)
      - [Install from Chrome Web Store](#install-from-chrome-web-store)
      - [Install from local .crx file](#install-from-local-crx-file)
      - [Install from unpackaged folder](#install-from-unpackaged-folder)
    - [Microsoft Edge:](#microsoft-edge)
      - [Install from Microsoft Edge Addons](#install-from-microsoft-edge-addons)
    - [Firefox (will be supported in later version)](#firefox-will-be-supported-in-later-version)
  - [Self-hosting Guide](#self-hosting-guide)
    - [Without Docker](#without-docker)
    - [With Docker](#with-docker)
  - [Release History](#release-history)
    - [v1.0.6](#v106)
    - [v1.0.5](#v105)
    - [v1.0.4](#v104)
    - [v1.0.3](#v103)
    - [v1.0.2](#v102)
    - [v0.0.1](#v001)
  - [Meta](#meta)
  - [Contributing](#contributing)
  - [FAQ](#faq)

<!-- /code_chunk_output -->

## Supported list

* [Iqiyi](https://www.iqiyi.com/) 
* [Youku](https://www.youku.com/)
* [Tencent Cloud](https://www.weiyun.com/)
* [Tencent Video](https://v.qq.com/)
* [YouTube](https://www.youtube.com/)
* [Mango TV](https://www.mgtv.com/)
* Local mp4 file via Browser
* [Local video file via VLC media player](https://www.videolan.org/vlc/index.html)

[Click here to tell us more](https://github.com/LouisYLWang/Sync-Sofa/issues/22)

## Setting

😊 This part is optional, we have already set default options for you, if you are not interested, please skip to [next part](#usage).

### Server list

Recently, Many Chinese users said our service is unstable, that is because our default server is located at us, so here is the server list, you can pick the nearest one.

* https://app.ylwang.me
* https://sync-cn.onns.xyz

Before setting, check server status here: [https://sync-status.onns.xyz/](https://sync-status.onns.xyz/).

We will be grateful for supporting us to build more server, if it is convenient (Cause this project is unprofitable).

<div>
<h5> Alipay, Wechat pay, Paypal</h5>
<img src="client/chrome_extension/images/alipay.png" alt="alipay" width="20.5%">
<img src="client/chrome_extension/images/wechat.png" alt="wechat" width="20%">
<img src="client/chrome_extension/images/paypal.jpg" alt="paypal" width="20%">
</div>

If you have already built your own server, and wanna share, please tell us! 

### Options page

There are two ways to visit options page.

1. Right click `Sync Sofa` extension, choose `Options`.
2. Left click `Sync Sofa` extension, choose `Setting` icon in popup page.

Your webpage should be like this:

![Sync Sofa - Options](https://onns.xyz/blog/image/20200629-3.png)

### Refresh video page

After saving options, please also refresh the video page or local mp4 page or [http://127.0.0.1:8080/](http://127.0.0.1:8080/) to make changes work.

## Usage

### Notices

⚠️ Before use, please make sure the version number of two clients are consistent. 

⚠️ If you want to play local `.mp4` file, please enable `Allow access to file URLs` in extension details page. 
1. Open `chrome://extensions/`, find `Sync Sofa`, click `Detaild` button, enable `Allow access to file URLs`.
2. Right click `Sync Sofa` extension, choose `Manage Extensions`, enable `Allow access to file URLs`.

⚠️ If there are multiple versions of extensions in your browser, please enable one and disable others.

### Open a video page

You two don't have to open the same webpage, you play the video via local `.mp4` file and your partner watch it one some video websites, is ok as long as you both watch the same video actually (source providers are different). 

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

Your partner receives the `room code`, click the `Sync Sofa` extension, paste it in the input area and click `START` button.

![User B](https://onns.xyz/blog/image/20200627-4.png)

### Enjoy yourselves

![User A](https://onns.xyz/blog/image/20200627-5.png)
![User B](https://onns.xyz/blog/image/20200627-6.png)

Now you can play the video, your operations will be synced to your partner. Enjoy yourselves!

## VLC support

If you and your partner play video via `VLC media player`, `Sync Sofa` can also synchronize your operations.

### Start VLC on the server with the Web Interface

First we need to enable controlling VLC via our browser, here is the official documentation:

* [Control VLC via a browser](https://wiki.videolan.org/Control_VLC_via_a_browser/)
* [Start VLC on the server with the Web Interface](https://wiki.videolan.org/Documentation:Modules/http_intf/#VLC_2.0.0_and_later)

1. Open VLC media player
2. Go `Tools → Preferences (select "All" radio-button) → Interface → Main interfaces`, check "Web"
  ![Step 2](https://onns.xyz/blog/image/20200628-1.png)
3. Go `Tools → Preferences (select "All" radio-button) → Interface → Main interfaces → Lua`, set `Lua HTTP - Password`
  ![Step 3](https://onns.xyz/blog/image/20200628-2.png)
4. `Save` and `reopen` VLC media player
5. Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/) in your browser

Your webpage should be like this:

![VLC media player - Web Interface](https://onns.xyz/blog/image/20200628-3.png)

### Request new code

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/), click the `Sync Sofa` extension and then click `REQUEST NEW CODE` button.

If nothing goes wrong you will receive a message like `Room created and room code copied to clipboard`, and the `room code` has been copied to your clipboard, send it to your partner.

### Start connection

Your partner receives the `room code`, click the `Sync Sofa` extension, paste it in the input area and click `START` button.

### Enjoy yourselves

Now you can play the video, your operations will be synced to your partner. Enjoy yourselves!

**Notice**:


⚠️ Keep your browser open and [http://127.0.0.1:8080/](http://127.0.0.1:8080/) itself.

### Close Controller webpage

After your video is finished, please click `STOP` button on `Sync Sofa` extension manually or just close [http://127.0.0.1:8080/](http://127.0.0.1:8080/).

## Installation

### Google Chrome

#### Install from Chrome Web Store

1. Open [Sync Sofa - Online Video Synchronizer - Chrome Web Store](https://chrome.google.com/webstore/detail/sync-sofa-online-video-sy/kgpnhgmpijhpkefpddoehhminpfiddmg) in your Chrome
2. Click `Add to Chrome` button
3. Choose `Add extension`

#### Install from local .crx file

1. Open [Github release page](https://github.com/LouisYLWang/Sync-Sofa/releases/latest)
2. Download `sync_sofa.[version].crx`, *[version]* is the number of the latest version 
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

## Self-hosting Guide

**Notices**:
⚠️ Before hosting, make sure your server can communicate securely with HTTPS and link to an domain name. All deploy script are based on Let's Encrypt certificates, you can customize with your own SSL certificate providers.
⚠️ dev mode intends for http transmission, prod mode intends for https transmission.

### Without Docker

**1. Get binary executable file**

- If you want to alter the source code and build yourself, make sure you have `golang environment` in your server, then run script below to get and build binary file:

  ```shell
  go get github.com/LouisYLWang/Sync-Sofa/server
  # If you don't know $GOPATH
  # try "go env GOPATH"
  cd $GOPATH/src/github.com/LouisYLWang/Sync-Sofa/server

  # Next step is optional
  # If you have any error message like:
  # "dial tcp 216.58.200.49:443: i/o timeout"
  # then try
  export GOPROXY=https://goproxy.io

  go install
  cd $GOPATH/bin
  ```

- If you want to only deploy the binary file:
  1. Open [Github release page](https://github.com/LouisYLWang/Sync-Sofa/releases/latest)
  2. Download `server` binary file for linux server
  3. Download `config.json` file to the same directory of binary file

**2. In the directory of binary file, adjust config file base on your need:**

- Config file variables:

  - `addr`: port of server
  - `runmode`:
    - dev: developing mode
    - prod: producting mode
  - `tlsdir`: TLS certificate paths
    - `tlskey`: TLS certificate privatekey path
    - `tlscert`: TLS certification path

  **Notices**: `addr`, `runmode` are mandatory, `tlskey`, `tlscert` are required for TLS connection

- minimal (non-https) config file:

  ```json
  {
    "addr": ":80",
    "runmode": "dev"
  }
  ```

- production environment (https) config file:
  ```json
  {
    "addr": ":443",
    "runmode": "prod",
    "tlsdir": {
      "tlskey": "/etc/letsencrypt/live/your.host.url/privkey.pem",
      "tlscert": "/etc/letsencrypt/live/your.host.url/fullchain.pem"
    }
  }

**3. Run `./server` to delopy the server, deployment is successful if you see:**

```
found config file, read parameters from config file...
server is listening at {your_port_number}...
```

### With Docker

Make sure docker service is runing on your server, make change to the script blow and run:
- variables
  - `ADDR`: port of server
  - `RUNMODE`:
    - dev: developing mode
    - prod: producting mode
  - `TLSKEYPATH`: TLS certificate privatekey path
  - `TLSCERTPATH`: TLS certification path

- minimal (non-https) hosting script:

  ```sh
  docker pull louisylwang/watchtogether

  export ADDR=:4000 \      
  export RUNMODE=dev \   
  export IMGNAME=yourimagename \   

  docker run -d \
  -e ADDR=:4000 \
  -e RUNMODE=RUNMODE \
  -p 4000:4000 \
  --name IMGNAME louisylwang/watchtogether
  ```

- production environment (https) hosting script:

  ```sh
  docker pull louisylwang/watchtogether

  export ADDR=:443 \      #your port
  export RUNMODE=prod \   #dev or prod
  export APIHOST=your.host.name \   #your host name
  export IMGNAME=yourimagename \   #your docker image name, set arbitrarily
  export TLSKEYPATH=/your/path/to/TLS/privatekey \
  export TLSCERTPATH=/your/path/to/TLS/certification \


  docker run -d \
  -e ADDR=:ADDR \
  #docker port to server:server port to docker, not necessarily the same
  -p ADDR:ADDR \ 
  -e RUNMODE=RUNMODE \
  #if you use letsencrypt, TLSKEY value should be /etc/letsencrypt/live/$APIHOST/privkey.pem
  -e TLSKEY=TLSKEYPATH \ 
  #if you use letsencrypt, TLSCERT value should be /etc/letsencrypt/live/$APIHOST/fullchain.pem 
  -e TLSCERT=TLSCERTPATH \ 
  #need to expose your TLS certification file to docker
  -v /etc/letsencrypt:/etc/letsencrypt:ro \ 
  --name IMGNAME louisylwang/watchtogether \
  --restart=always
  ```


- deployment is successful if you see in `docker logs {your docker image name}`:

  ```
  not found config file, read parameters from system variables...
  YYYY/MM/DD HH:MM:SS server is listening at :ADDR...
  ```

## Release History

### v1.0.6
🛠 update on 28 June 2020
---
⚠⚠⚠ Notice, this version is not compatible with any version before, please please please make sure your version is the same as your peer's version

- Add:
    - add support for Mango TV (happy Sistering 🤣)
    - add support for local video file syncing with VLC player #20
    - add options page - debugging mode & self-hosting option #21
    - add donating page
    - add new wiki page #11
- Fix:
    - improve sync performance & stability:
      - new sync logic, not compatible with any version before
      - improve buffer detection

### v1.0.5
🛠 update on 12 May 2020
---
Improve stability
  > Test for a new logic to avoid infinite echo back (each party repeat the last operation of other party) : introduce a queue as a buffer of operation and if the operations is beyond frequency threshold, the client will automatically to halt and cool down for sometime.

Add support for edge browser (beta)

### v1.0.4
🛠 update on 10 May 2020
---
Now user will get notification when they successfully connected to each other
Improve stability, better sync performance
Change the notification UI using sweetalert

### v1.0.3
🛠 update on 8 May 2020
---
improve stability & UX logic
Added support of following websites:
  - [iqiyi](https://www.iqiyi.com/) 
  - [youku](https://www.youku.com/)
  - [weiyun](https://www.weiyun.com/)
  - [tencent video](https://v.qq.com/)

Fixed the support of duonao live;
Removed the support of 91mjw (temporarily);
Refined documentation, will add more detail in next verison;

### v1.0.2
🛠 update on 31 Mar 2020
---
Add support of play process bar control sync
Fixed the issue that when syncing playing time, there is the possibility to crash the extension

### v0.0.1
🛠 update on 26 Mar 2020 (beta version)
---
Add support of 2 parties connection
Add support of sync pause and play action
Add support of out-of-sync notification

## Meta

Yiliang "Louis" Wang – [@blog](https://ylwang.codes/) – [@mail](mailto:louis.yl.wang@outlook.com)

Onns – [@blog](https://onns.xyz/) – [@mail](mailto:onns@onns.xyz)

## Contributing

1. Fork it (<https://github.com/LouisYLWang/Sync-Sofa/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

<!-- Markdown link & img dfn's -->

[chrome-image]: https://img.shields.io/chrome-web-store/users/kgpnhgmpijhpkefpddoehhminpfiddmg?style=flat-square
[chrome-url]: https://chrome.google.com/webstore/detail/sync-sofa-beta-online-vid/kgpnhgmpijhpkefpddoehhminpfiddmg

## FAQ 
1. **Q:** When I installed, Chrome popup says that Sync Sofa requires the permissions of `read and change your data on a number of websites` and `read your browsing history`, sounds so horrible, is that safe?
**A:** We do not collect your browsing data, the only thing we do is to get your current tab information and make sure you are visiting a site we support ([support list](#supported-list)). All information is collected and processed locally. We do not mess up the data on the websites you are watching, just inject a sync script to get your pause, play and seek operation. **All source code can be reviewed at [our github page](https://github.com/LouisYLWang/Sync-Sofa), we promise everything we did is necessary and not harmful.**

2. If your find your extension **button is darken**, please first make sure you are in a video playing page.

3. If you find your extension **can not request room code**, please first check the  [option page](#options-page) and click `RESET` button. If it still not work, please close your web browser, wait for a while and try again. Currently our server is hosting abroad, it may cause connecting issue.

4. If you find your extension cannot connect to your peer, please check following:
    1. please make sure the **version number** of two clients are consistent. To check the version number, you need to open [chrome extension page](chrome://extensions/) (if this link is not work, please type `chrome://extensions/` into the address bar and visit). You will find a extension with the title of `Sync Sofa - Online Video Synchronizer 1.0.6`. `1.0.6` is your current version number of Sync Sofa.
    2. If 4.1 does not solve your problem, please try step 2 again.



