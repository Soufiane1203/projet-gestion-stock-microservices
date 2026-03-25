#!/bin/sh
# ----------------------------------------------------------------------------
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
# ----------------------------------------------------------------------------

set -euo pipefail

if [ "${MVNW_VERBOSE-}" = true ]; then
  set -x
fi

if [ -z "${JAVA_HOME-}" ]; then
  JAVA="java"
else
  JAVA="$JAVA_HOME/bin/java"
fi

BASE_DIR=$(cd "$(dirname "$0")"; pwd -P)
WRAPPER_JAR="$BASE_DIR/.mvn/wrapper/maven-wrapper.jar"
WRAPPER_LAUNCHER="org.apache.maven.wrapper.MavenWrapperMain"

if [ ! -f "$WRAPPER_JAR" ]; then
  if [ -z "${MVNW_REPOURL-}" ]; then
    JAR_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
  else
    JAR_URL="${MVNW_REPOURL}/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
  fi
  echo "Downloading Maven Wrapper jar from $JAR_URL"
  mkdir -p "$BASE_DIR/.mvn/wrapper"
  curl -fsSL "$JAR_URL" -o "$WRAPPER_JAR"
fi

exec "$JAVA" \
  -Dmaven.multiModuleProjectDirectory="$BASE_DIR" \
  -classpath "$WRAPPER_JAR" \
  $WRAPPER_LAUNCHER "$@"
