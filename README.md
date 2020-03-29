### Server environment deploy:

dev build and run: 

```shell
./devbuild.sh
```



### Client  deploy:

#### Before load the unpacked extension: change port

The default port is :3000, if you want to make change to this, please change extension port manually:

in client\chrome_extension\content.js 

line 5

```
const apihost = "localhost:{your port}"
```

in client\chrome_extension\popup.js

line 13

```
const apihost = "localhost:{your port}"
```

#### load unpacked extension

1. Open the Extension Management page by navigating to

    

   ```
   chrome://extensions
   ```

   - The Extension Management page can also be opened by clicking on the Chrome menu, hovering over **More Tools** then selecting **Extensions**.

2. Enable Developer Mode by clicking the toggle switch next to **Developer mode**.

3. Click the **LOAD UNPACKED** button and select the extension directory.

source: https://developer.chrome.com/extensions/getstarted



