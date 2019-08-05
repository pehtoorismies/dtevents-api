# FROM node:10.16.0-alpine
FROM node:10.16.0

ENV WORKDIR=/home/node/app

WORKDIR ${WORKDIR}

COPY . ${WORKDIR}

RUN npm i -g --unsafe-perm prisma2
# RUN which prisma2

RUN yarn
RUN yarn build

EXPOSE 4000
ENTRYPOINT ["yarn"]
CMD ["start-prod"]
