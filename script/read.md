1. 登录 caludefare https://one.dash.cloudflare.com/ Networks->Connectors->create a tunnel
2. 用token 安装并启动 caludefared
3. 页面配置tuunel的 config。会远程同步。 ssh 配置 tcp来实现
4. cloudflared access tcp --hostname ssh.404040.net --url localhost:2223 启动，不能直接ssh 22端口。cloudflared为了安全必须使用cloudflared access
5. 使用 脚本添加 到 目标机器的ssh里

