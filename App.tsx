import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Caveat_600SemiBold } from '@expo-google-fonts/caveat/600SemiBold';
import { DancingScript_600SemiBold } from '@expo-google-fonts/dancing-script/600SemiBold';
import { MarckScript_400Regular } from '@expo-google-fonts/marck-script/400Regular';
import { Quicksand_600SemiBold } from '@expo-google-fonts/quicksand/600SemiBold';

import { createSurprisePreferences } from './src/domain/story/createSurprisePreferences';
import type { Story, StoryPreferences } from './src/domain/story/types';
import { StoryConfiguratorScreen } from './src/features/configurator/StoryConfiguratorScreen';
import { StoryReaderScreen } from './src/features/reader/StoryReaderScreen';
import { createInstallationRepository } from './src/services/installation/InstallationRepository';
import { createPreferencesRepository } from './src/services/preferences/PreferencesRepository';
import { generateStoryWithFallback } from './src/services/story/StoryGenerationService';
import { StoryGeneratingScreen } from './src/features/generation/StoryGeneratingScreen';
import { useStoryCreation } from './src/features/generation/useStoryCreation';
import { colors } from './src/ui/theme';

const initialPreferences: StoryPreferences = {
  protagonist: 'Valentina',
  age: 7,
  companions: [{ id: 'sapo-andres' }],
  environmentId: 'jardin',
  customEnvironment: '',
  magicItem: 'una pequeña flor de margarita dorada con brillo de rocío',
  valueId: 'amistad',
  customValue: '',
  toneId: 'calm',
  paragraphCount: 3,
  paragraphLength: 'medium',
  fontId: 'escolar',
};

const preferencesRepository = createPreferencesRepository(AsyncStorage);
const installationRepository = createInstallationRepository(AsyncStorage);
const storyApiUrl = process.env.EXPO_PUBLIC_STORY_API_URL;
const familyAccessToken = process.env.EXPO_PUBLIC_FAMILY_ACCESS_TOKEN;

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Escolar: require('./escolar1.ttf'),
    MaterialSymbols: require('./assets/fonts/MaterialSymbolsOutlined.ttf'),
    Caveat: Caveat_600SemiBold,
    DancingScript: DancingScript_600SemiBold,
    MarckScript: MarckScript_400Regular,
    Quicksand: Quicksand_600SemiBold,
  });
  const [preferences, setPreferences] = useState(initialPreferences);
  const [story, setStory] = useState<Story>();
  const [installationId, setInstallationId] = useState('');
  const { creating: storyLoading, error: creationError, create: createStory, clearError } = useStoryCreation(
    async () => {
      const minimumVisibleTime = new Promise<void>((resolve) => setTimeout(resolve, 1_200));
      const storyRequest = generateStoryWithFallback(preferences, {
        apiUrl: storyApiUrl,
        accessToken: familyAccessToken,
        installationId,
      });
      const [generatedStory] = await Promise.all([storyRequest, minimumVisibleTime]);
      return generatedStory;
    },
    setStory,
  );
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      preferencesRepository.load(initialPreferences),
      installationRepository.getOrCreate(),
    ])
      .then(([storedPreferences, storedInstallationId]) => {
        setPreferences(storedPreferences ?? initialPreferences);
        setInstallationId(storedInstallationId);
      })
      .finally(() => setPreferencesLoaded(true));
  }, []);

  useEffect(() => {
    if (preferencesLoaded) preferencesRepository.save(preferences).catch(() => undefined);
  }, [preferences, preferencesLoaded]);

  if ((!fontsLoaded && !fontError) || !preferencesLoaded) {
    return (
      <SafeAreaProvider>
        <SafeAreaView edges={['top', 'bottom']} style={styles.loading}>
          <StatusBar style="dark" />
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Abriendo el jardín…</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const surprise = () => setPreferences(createSurprisePreferences());

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <StatusBar style="dark" />
        {storyLoading || creationError ? (
          <StoryGeneratingScreen
            protagonist={preferences.protagonist}
            error={creationError}
            onRetry={createStory}
            onBack={clearError}
          />
        ) : story ? (
          <StoryReaderScreen
            creating={storyLoading}
            installationId={installationId}
            key={story.id}
            onEdit={() => setStory(undefined)}
            onRegenerate={createStory}
            story={story}
          />
        ) : (
          <StoryConfiguratorScreen
            onChange={setPreferences}
            onCreate={createStory}
            creating={storyLoading}
            onSurprise={surprise}
            preferences={preferences}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  loading: { flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: 14 },
  loadingText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
});
