netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=5173 connectaddress=127.0.0.1 connectport=5173
New-NetFirewallRule -DisplayName "WSL2 lab 5173" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173
