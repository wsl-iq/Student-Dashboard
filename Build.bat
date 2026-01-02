@echo off
title Building Student Dashboard Project Structure
color 0a

if "%OS%"=="Windows_NT" cls
if not "%OS%"=="Windows_NT" exit /B

echo +----------------------------------------------+
echo |     Creating Student Dashboard Project       |
echo +----------------------------------------------+

REM Create main project folder
mkdir project

REM Create main HTML files
echo. > project\index.html
echo. > project\tasks.html
echo. > project\grades.html
echo. > project\notes.html

REM Create CSS folder and file
mkdir project\css
echo. > project\css\style.css

REM Create JS folder and files
mkdir project\js
echo. > project\js\tasks.js
echo. > project\js\grades.js
echo. > project\js\notes.js

REM Create assets structure
mkdir project\assets
mkdir project\assets\icons
mkdir project\assets\fonts

echo +----------------------------------------------+
echo |    Project structure created successfully    |
echo +----------------------------------------------+

pause
