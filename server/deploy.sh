docker rm -f watchtogether
docker pull louisylwang/watchtogether

docker run -d \
-e ADDR=:443 \
-p 443:443 \
-e TLSKEY=/etc/letsencrypt/live/app.ylwang.me/privkey.pem \
-e TLSCERT=/etc/letsencrypt/live/app.ylwang.me/fullchain.pem \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
--name wtgt louisylwang/watchtogether