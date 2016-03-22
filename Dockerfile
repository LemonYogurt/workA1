#Version 1.0.0
FROM    node:0.12.1
MAINTAINER cyy
WORKDIR /adx-ui
ADD ./package.json /adx-ui/
RUN npm install
EXPOSE 3010
RUN \
    rm /etc/localtime && \
    ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
ENV NODE_ENV="production" \
	MONGO_HOST="mongodb://mongo-adpro-general-1:1301,mongo-adpro-general-2:1301,mongo-adpro-general-3:1301" \
	PORT=3010
ADD . /adx-ui
CMD node index.js