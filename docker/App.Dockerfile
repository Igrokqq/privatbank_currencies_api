FROM node:12-alpine

ENV NODE_ENV development

WORKDIR /var/www/app
COPY . /var/www/app/

RUN apk --update add g++ gcc libgcc libstdc++ linux-headers make python bash

RUN npm install && npm install --quiet node-gyp -g
RUN npm rebuild bcrypt --build-from-source

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "dev" ]
