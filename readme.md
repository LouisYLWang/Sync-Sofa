# Sync Sofa - streaming video playback synchronizer extension

> This chrome extension allows multi-user sync streaming video in a fast, simple and stable way.

![GitHub go.mod Go version (subfolder of monorepo)](https://img.shields.io/github/go-mod/go-version/LouisYLWang/Sync-Sofa?filename=server%2Fgo.mod&style=flat-square) [![Chrome web store users][chrome-image]][chrome-url]

Sync Sofa is a full stack web extension support a easy-to-use and stable way to synchronize streaming playback for multiple users. It can improve the experience when users from different locations want to share a video/movie remotely. Currently the feartures include:

- 2 party connection: either party can be the host of a sync room and the other can join with connection code.
- sync pause/play: each user pause/play the video, the other side will do the same
- sync play process bar control: the playing time change will also affect other side user
- out-of-sync notification: if any party disconnected/left the room, the other user will be notified.

---

<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->

<!-- code_chunk_output -->

- [Sync Sofa - streaming video playback synchronizer extension](#sync-sofa-streaming-video-playback-synchronizer-extension)
  - [Supported list](#supported-list)
  - [Installation](#installation)
    - [Google Chrome](#google-chrome)
      - [Install from Chrome Web Store](#install-from-chrome-web-store)
      - [Install from local .crx file](#install-from-local-crx-file)
      - [Install from unpackaged folder](#install-from-unpackaged-folder)
    - [Microsoft Edge:](#microsoft-edge)
      - [Install from Microsoft Edge Addons](#install-from-microsoft-edge-addons)
    - [Firefox (will be supported in later version)](#firefox-will-be-supported-in-later-version)
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

## Installation

### Google Chrome

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

### Notices

⚠️ Before use, please make sure the version number of two clients are consistent. 
⚠️ If you want to play local `.mp4` file, please enable `Allow access to file URLs` in extension details page, for example, `chrome://extensions/?id=djhbgkadejdmihbngglpnogjookpadjl` in Chrome.
⚠️ If there are multiple versions of extensions in your browser, please enable one and disable others.

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

Now you can play the video, your operations will be synced to your partner. Enjoy yourselves!

## VLC support

If you and your partner play video via `VLC media player`, `Sync Sofa` can also synchronize your operations.

### Start VLC on the server with the Web Interface

Fisrt we need to enable controlling VLC via our browser, here is the official documentation:

* [Control VLC via a browser](https://wiki.videolan.org/Control_VLC_via_a_browser/)
* [Start VLC on the server with the Web Interface](https://wiki.videolan.org/Documentation:Modules/http_intf/#VLC_2.0.0_and_later)

1. Open VLC media player
2. go `Tools → Preferences (select "All" radio-button) → Interface → Main interfaces`, check "Web"
  ![Step 2](https://onns.xyz/blog/image/20200628-1.png)
3. go `Tools → Preferences (select "All" radio-button) → Interface → Main interfaces → Lua`, set `Lua HTTP - Password`
  ![Step 3](https://onns.xyz/blog/image/20200628-2.png)
4. `Save` and `reopen` VLC media player
5. Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/) in your browser

Your webpage should be like this:

![VLC media player - Web Interface](https://onns.xyz/blog/image/20200628-3.png)

### Request new code

Open [http://127.0.0.1:8080/](http://127.0.0.1:8080/), click the `Sync Sofa` extension and then click `REQUEST NEW CODE` button.

If nothing goes wrong you will receive a message like `Room created and room code copied to clipboard`, and the `room code` has been copied to your clipboard, send it to your partner.

### Start connection

Your partner receive the `room code`, click the `Sync Sofa` extension, paste it in the input area and click `START` button.

### Enjoy yourselves

Now you can play the video, your operations will be synced to your partner. Enjoy yourselves!

**Notice**:
⚠️ Keep your browser open and [http://127.0.0.1:8080/](http://127.0.0.1:8080/) itself.

### Close Controller webpage

After your video is finished, please click `STOP` button on `Sync Sofa` extension manually or just close [http://127.0.0.1:8080/](http://127.0.0.1:8080/).


## Self-hosting Guide
**Notices**: 
Before hosting, make sure your server can communicate securely with HTTPS and link to an domain name. All deploy script are based on Let's Encrypt certificates, you can customized with your own SSL certificate providers.

### Without Docker:

#### Deploy script:
 
##### 1. Get binary exectuable file

- If you want to alter the source code and build yourself, make sure you have golang environment in your server, then run script below to get and build binary file:
    ```shell=
    go get github.com/LouisYLWang/Sync-Sofa/server
    cd $GOPATH/src/github.com/LouisYLWang/Sync-Sofa/server
    go install
    cd $GOPATH/bin
    ```
    
- If you want to only deploy the binary file:
    1. Open [Github release page](https://github.com/LouisYLWang/Sync-Sofa/releases/latest)
    2. Download `server` binary file for linux server
    3. Download `config.json` file to the same directory of binary file
    
##### 2. In the directory of binary file, adjust config file base on your need:

- Config file variables:

    - `addr`: port of server
    - `runmode`:
        - dev: developing mode
        - prod: producting mode
    - `tlsdir`: TLS certificate paths 
      - `tlskey`: TLS certificate privatekey path 
      - `tlscert`: TLS certification path
    - `feedbackservice`: an add-on for feeedback notification
      - `smtpserverhost`: feedback mail server host
      - `smtpserverport`: feedback mail server port 
      - `feedbackemailaddr`: feedback mail sender address (without @your-mail.host)
      - `feedbackemailpswd`: feedback mail sender password 
      - `recipients`: a list of feedback receivers mail address (with @your-mail.host)

    **Notices**: `addr`, `runmode` are mandatory, `tlskey`, `tlscert` are required for TLS connection


- example config file:

```json=
{
    "addr": ":443",
    "runmode": "prod",
    "tlsdir": {
        "tlskey": "/etc/letsencrypt/live/your.host.url/privkey.pem",
        "tlscert": "/etc/letsencrypt/live/your.host.url/fullchain.pem"
    },
    "feedbackservice":{
        "smtpserverhost": "smtp.gmail.com",
        "smtpserverport": "578",
        "feedbackemailaddr": "sender_mail_name",
        "feedbackemailpswd": "password",     
        "recipients":[
            "receiver1_mail_name@mail.host",
            "receiver2_mail_name@mail.host"
        ]
    }
  }
```
3. Run `./server` to delopy the server, deployment is successful if you see:

```
found config file, read parameters from config file...
server is listening at {your_port_number}...
```
### With Docker:
Make sure docker service is runing on your server, make change to the script blow and run:

```sh
docker pull louisylwang/watchtogether

docker run -d \
-p {your docker internal port}:{your external port} \
-v /etc/letsencrypt:/etc/letsencrypt:ro \ #if you use letsencrypt
-e ADDR=:{your port} \
-e TLSKEY={your tlskey name} \
-e TLSCERT={your tlscert name} \
-e SMTPSERVERHOST= {feedback mail server host} \
-e SMTPSERVERPORT= {feedback mail server port} \
-e FEEDBACKEMAILADDR= {feedback mail sender address} \
-e FEEDBACKEMAILPSWD= {feedback mail sender password} \
-e RUNMODE={"prod"/"dev"} \
-e RECIPIENTS= {a string with all targeted email address, separate by ",". exp: "rec1@mail.addr, rec2@mail.addr"}
--name {your docker image name} louisylwang/watchtogether
--restart=always
```


## Release History

### 🛠 update on 12 May 2020 - v 1.0.5
------------------------------------------------------------------------------------
Improve stability
  > Test for a new logic to avoid infinite echo back (each party repeat the last operation of other party) : introduce a queue as a buffer of operation and if the operations is beyond frequency threshold, the client will automatically to halt and cool down for sometime.

Add support for edge browser (beta)


### 🛠 update on 10 May 2020 - v 1.0.4
------------------------------------------------------------------------------------
Now user will get notification when they successfully connected to each other
Improve stability, better sync performance
Change the notification UI using sweetalert

### 🛠 update on 8 May 2020 - v 1.0.3
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

### 🛠 update on 31 Mar 2020 - 1.0.2
------------------------------------------------------------------------------------
Add support of play process bar control sync
Fixed the issue that when syncing playing time, there is the possibility to crash the extension


### 🛠 update on 26 Mar 2020 - 0.0.1 (beta version)
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
