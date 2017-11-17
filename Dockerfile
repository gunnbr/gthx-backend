FROM node:8.9.1-alpine

CMD ["node", "server.js"]
ENV HOME=/home/gthx

RUN addgroup -S gthx && adduser -S gthx -G gthx

USER gthx
COPY --chown=gthx:gthx package.json package-lock.json $HOME/

WORKDIR $HOME
RUN npm install --production

COPY --chown=gthx:gthx *.js* $HOME/
COPY --chown=gthx:gthx client/* $HOME/client/

