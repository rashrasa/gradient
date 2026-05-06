FROM node:24
WORKDIR /frontend
COPY . .
RUN npm ci
RUN npm build
CMD [ "npm", "start" ]