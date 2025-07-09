# 云主机部署

云主机部署需要一台服务器，一般为 Linux 系统，同时最好配置域名。域名购买后需配置 DNS 解析至云主机的 IP 地址。
后续的教程以域名 `n8n.example.com` 为例。

本教程我们使用 docker compose 进行云主机配置。以下操作使用 ssh 工具连接到云主机，使用命令行操作。

## 安装 docker & docker compose

在云主机上安装 docker，具体安装方式可以参考[官网](https://docs.docker.com/engine/install/)。
以下以 ubuntu 系统为例，介绍相关步骤（如果云主机已经有 docker 环境，可以跳过这一步）。

1. 卸载原始有冲突的包

```shell
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
```

2. 配置 docker 的 apt 源

```shell
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

3. 安装 docker

```shell
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

4. 验证安装

```shell
sudo docker run hello-world
```

5. 安装 docker compose

```shell
sudo apt-get install docker-compose-plugin
```

6. 非 root 用户使用 docker

```shell
sudo usermod -aG docker $USER
newgrp docker
```

## docker compose 部署 n8n

这里我们使用官方提供的 docker compose 配置来部署 n8n。使用 git 下载官方 self-hosting 仓库

```shell
git clone https://github.com/n8n-io/n8n-hosting.git
cd n8n-hosting/docker-compose/withPostgresAndWorker
```

这里我们使用`withPostgresAndWorker`目录中的配置，该配置包含 n8n、postgres、redis、worker 等服务。

编辑`.env`文件，修改其中的数据库密码等信息。密码可以使用在线工具生成，如<https://my.norton.com/extspa/passwordmanager?path=pwd-gen>。
`ENCRYPTION_KEY`是 n8n 的加密密钥，用于加密数据库中的数据，可以使用命令`openssl rand -base64 32`生成。

```properties
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changePassword
POSTGRES_DB=n8n

POSTGRES_NON_ROOT_USER=n8n
POSTGRES_NON_ROOT_PASSWORD=changePassword

ENCRYPTION_KEY=changeEncryptionKey

N8N_EDITOR_BASE_URL=https://n8n.example.com
WEBHOOK_URL=https://n8n.example.com

GENERIC_TIMEZONE=Asia/Shanghai
TZ=Asia/Shanghai
```

编辑`docker-compose.yml`文件，添加新增的环境变量配置。

```diff
--- a/docker-compose/withPostgresAndWorker/docker-compose.yml
+++ b/docker-compose/withPostgresAndWorker/docker-compose.yml
@@ -19,6 +19,11 @@ x-shared: &shared
     - QUEUE_BULL_REDIS_HOST=redis
     - QUEUE_HEALTH_CHECK_ACTIVE=true
     - N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
+    - N8N_EDITOR_BASE_URL=${N8N_EDITOR_BASE_URL}
+    - WEBHOOK_URL=${WEBHOOK_URL}
+    - GENERIC_TIMEZONE=${GENERIC_TIMEZONE}
+    - TZ=${TZ}
+
   links:
     - postgres
     - redis
```

编辑完成后，执行以下命令启动 n8n

```shell
docker compose up -d
```

现在 docker 开始拉取镜像，完成后，运行`docker compose ps`，可以看到 n8n、postgres、redis、
worker 等服务都启动了，如下

```plaintext
NAME                                 IMAGE                     COMMAND                  SERVICE      CREATED         STATUS                   PORTS
withpostgresandworker-n8n-1          docker.n8n.io/n8nio/n8n   "tini -- /docker-ent…"   n8n          5 minutes ago   Up 5 minutes             0.0.0.0:5678->5678/tcp, [::]:5678->5678/tcp
withpostgresandworker-n8n-worker-1   docker.n8n.io/n8nio/n8n   "tini -- /docker-ent…"   n8n-worker   5 minutes ago   Up 5 minutes             5678/tcp
withpostgresandworker-postgres-1     postgres:16               "docker-entrypoint.s…"   postgres     5 minutes ago   Up 5 minutes (healthy)   5432/tcp
withpostgresandworker-redis-1        redis:6-alpine            "docker-entrypoint.s…"   redis        5 minutes ago   Up 5 minutes (healthy)   6379/tcp
```

> 上述的 docker compose 配置文件中启动了两个 n8n 实例，其中一个是主实例，一个是 worker 实例。
> 该模式为队列运行模式，使用 redis 作为消息队列。理论上这种模式可以扩展到更多的 worker，进行
> 分布式部署，提高 n8n 的并发处理能力。详细的描述可以参考官方文档<https://docs.n8n.io/hosting/scaling/queue-mode/>

## 配置反向代理

编辑域名解析，将域名指向云主机的 IP 地址。这里我们使用 Caddyserver 作为我们的反向代理服务器。
Caddyserver 是一个开源的、高性能的、易用的反向代理服务器，可以类比 Nginx，
其官网为<https://caddyserver.com/>。Caddyserver 最大的优势是可以自动管理 SSL 证书，无需手动配置。

以下介绍如何使用 Caddyserver 配置反向代理。

1. 安装 Caddyserver，参考官方文档<https://caddyserver.com/docs/install>

```shell
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

2. 配置 Caddyserver，编辑`/etc/caddy/Caddyfile`文件，添加以下内容（替换其中的域名）

```plaintext
n8n.example.com {
    reverse_proxy localhost:5678
}
```

3. 重启 Caddyserver

```shell
sudo systemctl restart caddy
```

4. 访问域名，即可看到 n8n 的界面
