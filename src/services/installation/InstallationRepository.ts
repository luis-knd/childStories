import type { KeyValueStorage } from '../preferences/PreferencesRepository';

const STORAGE_KEY = 'el-jardin-secreto:installation-id:v1';

function createUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const randomValue = Math.floor(Math.random() * 16);
    const value = character === 'x' ? randomValue : (randomValue & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function createInstallationRepository(
  storage: KeyValueStorage,
  idFactory: () => string = createUuid,
) {
  return {
    async getOrCreate(): Promise<string> {
      const existingId = await storage.getItem(STORAGE_KEY);
      if (existingId) return existingId;
      const installationId = idFactory();
      await storage.setItem(STORAGE_KEY, installationId);
      return installationId;
    },
  };
}
