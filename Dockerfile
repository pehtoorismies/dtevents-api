# FROM node:10.16.0-alpine
# FROM node:10.16.0
FROM node:10.16.0-alpine

ENV WORKDIR=/home/node/app

WORKDIR ${WORKDIR}

COPY . ${WORKDIR}

RUN yarn
RUN yarn build

EXPOSE 4000
ENTRYPOINT ["yarn"]
CMD ["start-prod"]
