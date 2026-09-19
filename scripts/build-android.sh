#!/usr/bin/env bash
set -euo pipefail

readonly PROJECT_ROOT="${PROJECT_ROOT:-/workspace}"
readonly OUTPUT_DIR="${OUTPUT_DIR:-/output}"
readonly ANDROID_SIGNING_DIR="${ANDROID_SIGNING_DIR:-/signing}"
readonly KEYSTORE_FILE="${ANDROID_SIGNING_DIR}/el-jardin-secreto.keystore"
readonly APK_NAME="el-jardin-secreto.apk"

print_usage() {
  printf '%s\n' \
    'Uso: build-android.sh [--dry-run|--help]' \
    '' \
    'Compila localmente un APK release firmado, sin utilizar EAS.'
}

print_dry_run() {
  printf '%s\n' \
    'npm ci --no-audit --no-fund' \
    'npx expo prebuild --clean --platform android --no-install' \
    'keytool -genkeypair (solo cuando no existe la clave persistente)' \
    './gradlew :app:assembleRelease --no-daemon --no-build-cache' \
    "copy app-release.apk -> ${OUTPUT_DIR}/${APK_NAME}" \
    "export public certificate -> ${OUTPUT_DIR}/el-jardin-secreto-cert.pem" \
    "write certificate fingerprint -> ${OUTPUT_DIR}/certificate-sha256.txt"
}

generate_signing_key() {
  if [[ -f "${KEYSTORE_FILE}" ]]; then
    return
  fi

  printf '%s\n' 'Creando un certificado Android único y persistente…'
  keytool -genkeypair \
    -alias androiddebugkey \
    -keyalg RSA \
    -keysize 4096 \
    -validity 10000 \
    -storetype PKCS12 \
    -keystore "${KEYSTORE_FILE}" \
    -storepass android \
    -keypass android \
    -dname 'CN=El Jardin Secreto, OU=Personal, O=Child Stories, C=ES' \
    -noprompt >/dev/null
  chmod 600 "${KEYSTORE_FILE}"
}

verify_release_signing_contract() {
  local gradle_file="${PROJECT_ROOT}/android/app/build.gradle"
  if grep -q 'signingConfig signingConfigs.debug' "${gradle_file}"; then
    return
  fi

  printf '%s\n' \
    'La plantilla Android ya no firma release con signingConfigs.debug.' \
    'Revisa el contrato de firma antes de compilar para no generar un APK con otra clave.' >&2
  exit 1
}

copy_artifacts() {
  local source_apk="${PROJECT_ROOT}/android/app/build/outputs/apk/release/app-release.apk"
  local target_apk="${OUTPUT_DIR}/${APK_NAME}"
  if [[ ! -f "${source_apk}" ]]; then
    printf 'No se encontró el APK esperado: %s\n' "${source_apk}" >&2
    exit 1
  fi

  cp "${source_apk}" "${target_apk}"
  (cd "${OUTPUT_DIR}" && sha256sum "${APK_NAME}") > "${target_apk}.sha256"
  keytool -exportcert -rfc \
    -alias androiddebugkey \
    -keystore "${KEYSTORE_FILE}" \
    -storepass android \
    -file "${OUTPUT_DIR}/el-jardin-secreto-cert.pem" >/dev/null
  keytool -list -v \
    -alias androiddebugkey \
    -keystore "${KEYSTORE_FILE}" \
    -storepass android \
    | awk -F': ' '/SHA256:/{print $2; exit}' \
    > "${OUTPUT_DIR}/certificate-sha256.txt"
}

restore_host_ownership() {
  if [[ "${HOST_UID:-}" =~ ^[0-9]+$ ]] && [[ "${HOST_GID:-}" =~ ^[0-9]+$ ]]; then
    chown -R "${HOST_UID}:${HOST_GID}" \
      "${PROJECT_ROOT}/android" \
      "${OUTPUT_DIR}" \
      "${ANDROID_SIGNING_DIR}"
  fi
}

main() {
  case "${1:-}" in
    --dry-run)
      print_dry_run
      return
      ;;
    --help|-h)
      print_usage
      return
      ;;
    '') ;;
    *)
      print_usage >&2
      exit 2
      ;;
  esac

  mkdir -p "${OUTPUT_DIR}" "${ANDROID_SIGNING_DIR}"
  cd "${PROJECT_ROOT}"
  npm ci --no-audit --no-fund
  npx expo prebuild --clean --platform android --no-install
  generate_signing_key
  verify_release_signing_contract
  install -m 600 "${KEYSTORE_FILE}" android/app/debug.keystore
  android/gradlew -p android :app:assembleRelease --no-daemon --no-build-cache
  copy_artifacts
  restore_host_ownership

  printf '\nAPK generado: %s/%s\n' "${OUTPUT_DIR}" "${APK_NAME}"
  printf 'Certificado público: %s/el-jardin-secreto-cert.pem\n' "${OUTPUT_DIR}"
  printf 'Huella del certificado: %s/certificate-sha256.txt\n' "${OUTPUT_DIR}"
}

main "$@"
