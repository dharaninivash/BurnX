@echo off
echo ==========================================
echo FitAxis iOS IPA Builder
echo ==========================================
echo.
echo Please note: Building for iOS requires a paid Apple Developer Account.
echo If it asks you to login to Expo or Apple, please enter your details.
echo.
call npx eas-cli build -p ios
echo.
echo Build command finished! Check the terminal above for your status.
pause
