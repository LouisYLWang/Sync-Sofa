docker rm -f wtgt
docker pull louisylwang/watchtogether

docker run -d \
-e ADDR=:443 \
-p 443:443 \
-e TLSKEY=/etc/letsencrypt/live/$1/privkey.pem \
-e TLSCERT=/etc/letsencrypt/live/$1/fullchain.pem \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
--name wtgt louisylwang/watchtogether