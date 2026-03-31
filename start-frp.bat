@echo off
echo ========================================
echo 启动校研会系统 + FRP内网穿透
echo ========================================
echo.

echo [1/2] 启动本地项目...
cd /d D:\01_work\act_record
start "校研会系统" cmd /k "npm run dev"

echo.
echo [2/2] 启动FRP客户端...
timeout /t 10 /nobreak >nul
cd /d D:\01_work\act_record\frp
start "FRP客户端" cmd /k "frpc.exe -c frpc.ini"

echo.
echo ========================================
echo 服务启动完成！
echo 访问地址：http://你的服务器IP:8080
echo ========================================
echo.
pause