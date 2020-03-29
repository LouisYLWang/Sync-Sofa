GOOS="linux" go build
docker build -t louisylwang/syncsofadev .
go clean

docker rm -f syncsofadev

docker run -d \
-e ADDR=:3000 \
-e RUNMODE="dev" \
-p 3000:3000 \
--name syncsofadev louisylwang/syncsofadev