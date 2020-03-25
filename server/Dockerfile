FROM alpine
RUN apk add --no-cache ca-certificates
COPY server /server
EXPOSE 443
ENTRYPOINT ["/server"]