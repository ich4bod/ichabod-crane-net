# Stage 1: render the site. The Hugo binary is non-extended (a static Go
# binary, so it runs on alpine) because the theme ships no SCSS — nothing
# here needs the libsass build.
FROM alpine:3.20 AS builder

ARG HUGO_VERSION=0.165.0

RUN apk add --no-cache curl tar \
 && curl -fsSL -o /tmp/hugo.tar.gz \
      "https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-amd64.tar.gz" \
 && tar -xzf /tmp/hugo.tar.gz -C /usr/local/bin hugo \
 && rm /tmp/hugo.tar.gz \
 && hugo version

WORKDIR /src
COPY . .
RUN hugo --minify --gc --destination /out

# Stage 2: serve it. The Hugo binary does not come along; what ships is a
# directory of files and a web server.
FROM nginx:1.27-alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/site.conf
COPY --from=builder /out /usr/share/nginx/html

EXPOSE 3000
