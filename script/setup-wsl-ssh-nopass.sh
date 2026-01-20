#!/bin/bash

# 配置部分（按你的环境修改）
WSL_HOST="localhost"
WSL_PORT="2223"
WSL_USER="silin"

PUBKEY="$HOME/.ssh/id_ed25519.pub"

echo "🔍 检查公钥：$PUBKEY"
if [ ! -f "$PUBKEY" ]; then
    echo "❌ 找不到公钥，请先运行：ssh-keygen"
    exit 1
fi

echo "📤 上传公钥到 WSL..."
ssh -p "$WSL_PORT" "$WSL_USER@$WSL_HOST" "mkdir -p ~/.ssh && chmod 700 ~/.ssh"

# 追加公钥
cat "$PUBKEY" | ssh -p "$WSL_PORT" "$WSL_USER@$WSL_HOST" 'cat >> ~/.ssh/authorized_keys'

# 设置权限
ssh -p "$WSL_PORT" "$WSL_USER@$WSL_HOST" "chmod 600 ~/.ssh/authorized_keys"

# 重启 SSH 服务
echo "🔄 重启 WSL SSH 服务..."
ssh -p "$WSL_PORT" "$WSL_USER@$WSL_HOST" "sudo systemctl restart ssh"

echo "✅ 完成！现在可以无密码登录了："
echo "ssh -p $WSL_PORT $WSL_USER@$WSL_HOST"