@echo off
echo ==========================================
echo FitAxis Android APK Builder
echo ==========================================
echo.
echo Please note: If this is your first time, you MUST be logged into Expo.
echo If it asks you to login, please enter your Expo account details.
echo.
call npx eas-cli build -p android --profile preview
echo.
echo Build command finished! Check the terminal above for your APK download link.
pause
