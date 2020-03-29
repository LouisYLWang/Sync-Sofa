dev build and run: 

```shell
./devbuild.sh
```

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

