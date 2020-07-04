docker rm -f wtgt
docker pull louisylwang/watchtogether

export ADDR= \
export SMTPSERVERHOST= \
export SMTPSERVERPORT= \
export FEEDBACKEMAILADDR= \
export FEEDBACKEMAILPSWD= \
export RUNMODE= \
export APIHOST= \


docker run -d \
-e ADDR=:ADDR \
-p ADDR:ADDR \
-e TLSKEY=/etc/letsencrypt/live/$APIHOST/privkey.pem \
-e TLSCERT=/etc/letsencrypt/live/$APIHOST/fullchain.pem \
-v /etc/letsencrypt:/etc/letsencrypt:ro \
-e SMTPSERVERHOST=SMTPSERVERHOST \
-e SMTPSERVERPORT=SMTPSERVERPORT \
-e FEEDBACKEMAILADDR=FEEDBACKEMAILADDR \
-e FEEDBACKEMAILPSWD=FEEDBACKEMAILPSWD \
-e RUNMODE=RUNMODE \
--name wtgt louisylwang/watchtogether
--restart=always

'''
minimalistic hosting

docker run -d \
-e ADDR=:4000 \
-e RUNMODE="dev" \
-p 4000:4000 \
--name wtgt louisylwang/watchtogether
'''