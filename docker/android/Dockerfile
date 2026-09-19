FROM node:22.13.1-bookworm-slim

ARG ANDROID_COMMAND_LINE_TOOLS_VERSION=15859902
ARG ANDROID_COMMAND_LINE_TOOLS_SHA256=4e4c464f145a7512b57d088ac6c278c03c9eea610886b35a5e0804e74eedf583

ENV ANDROID_HOME=/opt/android-sdk \
    ANDROID_SDK_ROOT=/opt/android-sdk \
    JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 \
    PATH=/opt/android-sdk/cmdline-tools/latest/bin:/opt/android-sdk/platform-tools:/opt/android-sdk/build-tools/36.0.0:/usr/lib/jvm/java-17-openjdk-amd64/bin:$PATH \
    CI=1 \
    EXPO_NO_GIT_STATUS=1 \
    NODE_ENV=production \
    NPM_CONFIG_CACHE=/npm-cache \
    GRADLE_USER_HOME=/gradle-cache \
    LC_ALL=C.UTF-8

RUN apt-get update \
    && apt-get install --yes --no-install-recommends \
      build-essential \
      ca-certificates \
      curl \
      git \
      openjdk-17-jdk-headless \
      ninja-build \
      python3 \
      unzip \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p "${ANDROID_HOME}/cmdline-tools" \
    && curl --fail --location --show-error \
      "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_COMMAND_LINE_TOOLS_VERSION}_latest.zip" \
      --output /tmp/android-command-line-tools.zip \
    && printf '%s  %s\n' \
      "${ANDROID_COMMAND_LINE_TOOLS_SHA256}" \
      /tmp/android-command-line-tools.zip \
      | sha256sum --check --strict \
    && unzip -q /tmp/android-command-line-tools.zip -d "${ANDROID_HOME}/cmdline-tools" \
    && mv "${ANDROID_HOME}/cmdline-tools/cmdline-tools" "${ANDROID_HOME}/cmdline-tools/latest" \
    && rm /tmp/android-command-line-tools.zip

RUN yes | sdkmanager --licenses >/dev/null \
    && sdkmanager \
      "build-tools;35.0.0" \
      "build-tools;36.0.0" \
      "cmake;3.22.1" \
      "cmake;3.30.5" \
      "ndk;27.1.12297006" \
      "platform-tools" \
      "platforms;android-36"

COPY scripts/build-android.sh /usr/local/bin/build-android
RUN chmod 755 /usr/local/bin/build-android \
    && mkdir -p /gradle-cache /npm-cache /output /signing /workspace

WORKDIR /workspace
ENTRYPOINT ["build-android"]
