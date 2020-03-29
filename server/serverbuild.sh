$env:GOOS="linux" 
go build
docker build -t louisylwang/watchtogether .
docker push louisylwang/watchtogether
go clean

ssh -i ~/.ssh/DemoKey.pem ec2-user@ylwang.me < deploy.sh