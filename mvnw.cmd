@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@echo off
setlocal

set DIRNAME=%~dp0
if "%DIRNAME%"=="" set DIRNAME=.
set APP_BASE_NAME=%~n0
set APP_HOME=%DIRNAME%
if "%APP_HOME:~-1%"=="\" set APP_HOME=%APP_HOME:~0,-1%

set WRAPPER_JAR="%APP_HOME%\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

if exist %WRAPPER_JAR% goto executeWrapper

if not defined MVNW_REPOURL (
  set JAR_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
) else (
  set JAR_URL=%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar
)

echo Downloading Maven Wrapper jar from %JAR_URL%
if not exist "%APP_HOME%\.mvn\wrapper" mkdir "%APP_HOME%\.mvn\wrapper"
powershell -Command "Invoke-WebRequest -UseBasicParsing -Uri '%JAR_URL%' -OutFile '%WRAPPER_JAR%'" >NUL 2>&1
if %ERRORLEVEL% neq 0 (
  echo Failed to download Maven Wrapper jar
  exit /b %ERRORLEVEL%
)

:executeWrapper
set JAVA_EXE=java
if defined JAVA_HOME (
  set JAVA_EXE="%JAVA_HOME%\bin\java.exe"
)

%JAVA_EXE% -Dmaven.multiModuleProjectDirectory="%APP_HOME%" -classpath %WRAPPER_JAR% %WRAPPER_LAUNCHER% %*
endlocal
