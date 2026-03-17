#!/bin/bash
# WSL2 interop 経由で Windows 管理者 PowerShell を起動してポートプロキシを設定する。
# DevContainer（Docker）環境では interop が使えないためコマンドを表示するだけ。

ACTION="${1:-}"
POWERSHELL="/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_manual() {
  echo ""
  echo "Windows 管理者 PowerShell で以下を実行してください:"
  echo ""
  if [ "$ACTION" = "start" ]; then
    echo "  netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=5173 connectaddress=127.0.0.1 connectport=5173"
    echo "  New-NetFirewallRule -DisplayName \"WSL2 lab 5173\" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173"
  else
    echo "  netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=5173"
    echo "  Remove-NetFirewallRule -DisplayName \"WSL2 lab 5173\""
  fi
  echo ""
}

if [ "$ACTION" != "start" ] && [ "$ACTION" != "stop" ]; then
  echo "Usage: $0 start|stop" >&2
  exit 1
fi

if [ -x "$POWERSHELL" ] && command -v wslpath >/dev/null 2>&1; then
  WIN_SCRIPT=$(wslpath -w "$SCRIPT_DIR/proxy-${ACTION}.ps1")
  "$POWERSHELL" -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"$WIN_SCRIPT\"'"
  echo "UAC プロンプトを承認してください。"
else
  echo "DevContainer 環境のため PowerShell を直接起動できません。"
  print_manual
fi
