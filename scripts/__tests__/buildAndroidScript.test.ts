import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('build-android.sh', () => {
  it('describes a fully local release build without executing it', () => {
    const script = resolve(process.cwd(), 'scripts/build-android.sh');
    const result = spawnSync('bash', [script, '--dry-run'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('npm ci');
    expect(result.stdout).toContain('expo prebuild --clean --platform android');
    expect(result.stdout).toContain(':app:assembleRelease');
    expect(result.stdout).toContain('--no-build-cache');
    expect(result.stdout).toContain('el-jardin-secreto.apk');
    expect(result.stdout).toContain('el-jardin-secreto-cert.pem');
    expect(result.stdout).toContain('certificate-sha256.txt');
  });
});
