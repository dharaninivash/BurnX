@echo off
echo ==========================================
echo FitAxis Web Application Exporter
echo ==========================================
echo.
echo Exporting web application...
echo.
call npx expo export -p web
echo.
echo ==========================================
echo Web Export Complete!
echo You can find your web files in the "dist" folder.
echo You can upload the "dist" folder to Vercel, Netlify, or Firebase.
echo ==========================================
pause
