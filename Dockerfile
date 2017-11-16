FROM node:8.9.0

CMD ["dumb-init", "node", "server.js"]
ENV HOME=/home/gthx

RUN \
    useradd --user-group --create-home --shell /bin/false gthx && \
    wget https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64.deb && \
    dpkg -i dumb-init_*.deb

COPY package.json package-lock.json $HOME/
RUN chown -R gthx:gthx $HOME/*

USER gthx
WORKDIR $HOME
RUN npm install --production

COPY *.js $HOME/
COPY *.json $HOME/
COPY client/* $HOME/client/
USER root
RUN chown -R gthx:gthx $HOME/*
USER gthx

