netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=5173
Remove-NetFirewallRule -DisplayName "WSL2 lab 5173"
