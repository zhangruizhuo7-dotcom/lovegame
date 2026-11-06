# 微信云托管专属轻量高效镜像
FROM node:20-alpine AS builder

WORKDIR /app

# 配置国内腾讯云 npm 镜像源加速构建
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源码并构建前端产物
COPY . .
RUN npm run build

# 生产运行镜像
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80

RUN npm config set registry https://mirrors.cloud.tencent.com/npm/

COPY package*.json ./
RUN npm install --omit=dev

# 从构建阶段复制必要静态资源与服务端代码
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/服务端 ./服务端

# 微信云托管标准默认端口
EXPOSE 80

CMD ["node", "服务端/双端联机服务.js"]
