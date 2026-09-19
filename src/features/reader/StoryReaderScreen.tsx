import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';

import { fonts } from '../../domain/story/catalog';
import type { Story } from '../../domain/story/types';
import type { Illustration } from '../../services/illustrations/OpenverseIllustrationService';
import { findStoryIllustration } from '../../services/illustrations/StoryIllustrationService';
import { colors, radii } from '../../ui/theme';
import { GardenFallbackIllustration } from './GardenFallbackIllustration';
import { createNarrationSequence } from './storyNarration';
import { createStoryPages, moveStoryPage } from './storyPagination';

interface StoryReaderScreenProps {
  story: Story;
  installationId: string;
  onEdit: () => void;
  onRegenerate: () => void;
  creating?: boolean;
}

type ReaderTab = 'story' | 'questions';
type IllustrationSource = 'dynamic' | 'openverse';

const storyApiUrl = process.env.EXPO_PUBLIC_STORY_API_URL;
const familyAccessToken = process.env.EXPO_PUBLIC_FAMILY_ACCESS_TOKEN;
const hasDynamicIllustrations = Boolean(storyApiUrl?.trim() && familyAccessToken?.trim());

export function StoryReaderScreen({
  story,
  installationId,
  onEdit,
  onRegenerate,
  creating = false,
}: StoryReaderScreenProps) {
  const [activeTab, setActiveTab] = useState<ReaderTab>('story');
  const [currentPage, setCurrentPage] = useState(0);
  const [illustration, setIllustration] = useState<Illustration>();
  const [imageRevision, setImageRevision] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [illustrationSource, setIllustrationSource] = useState<IllustrationSource>('dynamic');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const narrationSession = useRef(0);
  const fontFamily = fonts.find((font) => font.id === story.preferences.fontId)?.family ?? 'Escolar';
  const pages = useMemo(() => createStoryPages(story.paragraphs), [story.paragraphs]);
  const narrationSequence = useMemo(
    () => createNarrationSequence(story.title, story.paragraphs, story.moral),
    [story.moral, story.paragraphs, story.title],
  );
  const page = pages[currentPage];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === pages.length - 1;

  const stopNarration = () => {
    narrationSession.current += 1;
    Speech.stop();
    setIsSpeaking(false);
  };

  const handleBack = () => {
    if (isSpeaking) stopNarration();
    if (activeTab === 'questions') {
      setActiveTab('story');
    } else if (currentPage > 0) {
      setCurrentPage((current) => moveStoryPage(current, -1, pages.length));
    } else {
      onEdit();
      return;
    }
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    let active = true;
    setImageLoading(true);
    setImageFailed(false);
    findStoryIllustration({
      prompt: story.illustrationPrompt,
      fallbackQuery: story.illustrationQuery,
      seed: Date.now() + imageRevision,
      apiUrl: illustrationSource === 'dynamic' ? storyApiUrl : undefined,
      accessToken: illustrationSource === 'dynamic' ? familyAccessToken : undefined,
      installationId,
    })
      .then((result) => {
        if (active) setIllustration(result);
      })
      .catch(() => {
        if (active) setIllustration(undefined);
      })
      .finally(() => {
        if (active) setImageLoading(false);
      });
    return () => {
      active = false;
    };
  }, [illustrationSource, imageRevision, installationId, story.id, story.illustrationPrompt, story.illustrationQuery]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [activeTab, currentPage, isSpeaking, onEdit, pages.length]);

  useEffect(() => () => {
    narrationSession.current += 1;
    Speech.stop();
  }, []);

  const speakSegment = (segmentIndex: number, sessionId: number) => {
    const segment = narrationSequence[segmentIndex];
    if (!segment || sessionId !== narrationSession.current) {
      setIsSpeaking(false);
      return;
    }

    setActiveTab('story');
    setCurrentPage(segment.pageIndex);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    Speech.speak(segment.text, {
      language: 'es-ES',
      pitch: 1.02,
      rate: 0.88,
      onDone: () => {
        if (sessionId !== narrationSession.current) return;
        const nextSegment = segmentIndex + 1;
        if (nextSegment < narrationSequence.length) {
          speakSegment(nextSegment, sessionId);
        } else {
          setIsSpeaking(false);
        }
      },
      onError: () => {
        if (sessionId === narrationSession.current) setIsSpeaking(false);
      },
      onStopped: () => {
        if (sessionId === narrationSession.current) setIsSpeaking(false);
      },
    });
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      stopNarration();
      return;
    }

    const firstSegment = Math.min(currentPage, Math.max(0, narrationSequence.length - 1));
    const sessionId = narrationSession.current + 1;
    narrationSession.current = sessionId;
    setIsSpeaking(true);
    speakSegment(firstSegment, sessionId);
  };

  const refreshImage = () => {
    setImageFailed(false);
    setIllustrationSource('dynamic');
    setImageRevision((current) => current + 1);
  };

  const handleImageError = () => {
    if (illustration?.provider === 'cloudflare' && illustrationSource === 'dynamic') {
      setIllustrationSource('openverse');
      return;
    }
    setImageFailed(true);
  };

  const selectTab = (tab: ReaderTab) => {
    if (isSpeaking) stopNarration();
    setActiveTab(tab);
    if (tab === 'story') setCurrentPage((current) => moveStoryPage(current, 0, pages.length));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goForward = () => {
    if (isSpeaking) stopNarration();
    if (isLastPage) {
      setActiveTab('questions');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setCurrentPage((current) => moveStoryPage(current, 1, pages.length));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goBack = () => {
    if (isSpeaking) stopNarration();
    setCurrentPage((current) => moveStoryPage(current, -1, pages.length));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Volver" accessibilityRole="button" onPress={handleBack} style={styles.headerIconButton}>
          <Text style={styles.headerIconText}>‹</Text>
        </Pressable>
        <View style={styles.headerBookIcon}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={require('../../../assets/brand-logo.png')}
            style={styles.headerBrandLogo}
          />
        </View>
        <Text numberOfLines={1} style={styles.headerTitle}>Lector de cuentos</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: creating, busy: creating }}
          disabled={creating}
          onPress={onRegenerate}
          style={[styles.newStoryButton, creating && styles.disabledButton]}
        >
          <Text style={styles.newStoryText}>{creating ? 'Creando…' : '✦ Nuevo'}</Text>
        </Pressable>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.pageStatus}>
          <Text style={styles.pageStatusIcon}>▤</Text>
          <Text style={styles.pageStatusText}>
            {activeTab === 'story' ? `Página ${currentPage + 1} de ${pages.length}` : 'Conversar sobre el cuento'}
          </Text>
        </View>
        <Pressable accessibilityRole="button" onPress={toggleSpeech} style={[styles.audioButton, isSpeaking && styles.audioButtonActive]}>
          <Text style={[styles.audioButtonText, isSpeaking && styles.audioButtonTextActive]}>
            {isSpeaking ? '■ Detener' : '◖ Escuchar'}
          </Text>
        </Pressable>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.readingDesk}>
          <View style={styles.bookCover}>
            <View style={styles.gildedTrim}>
              <View style={styles.pageStack}>
                <View pointerEvents="none" style={styles.pageStackSide}>
                  {Array.from({ length: 8 }, (_, index) => <View key={`side-${index}`} style={styles.pageEdgeLine} />)}
                </View>
                <View pointerEvents="none" style={styles.pageStackBottom}>
                  {Array.from({ length: 5 }, (_, index) => <View key={`bottom-${index}`} style={styles.pageEdgeLine} />)}
                </View>
                <View style={styles.paperPage}>
                  <View style={styles.pageGutter} />
                  {activeTab === 'story' && !isFirstPage && illustration && !imageFailed ? (
                    <View pointerEvents="none" style={styles.pageBackground}>
                      <Image resizeMode="cover" source={{ uri: illustration.uri }} style={styles.pageBackgroundImage} />
                      <View style={styles.pageBackgroundWash} />
                    </View>
                  ) : null}
                  <View style={styles.storyHeading}>
                    <Text style={styles.ornament}>✦  EL RINCÓN DE {story.preferences.protagonist.toUpperCase()}  ✦</Text>
                    <Text style={[styles.storyTitle, { fontFamily }]}>{story.title}</Text>
                    <Text style={styles.storySubtitle}>{story.subtitle}</Text>
                  </View>

                  {activeTab === 'story' && isFirstPage ? (
                    <>
                      <View style={styles.illustrationPlate}>
                        <View style={styles.illustrationFrame}>
                          {illustration && !imageFailed ? (
                            <Image onError={handleImageError} resizeMode="cover" source={{ uri: illustration.uri }} style={styles.illustration} />
                          ) : (
                            <GardenFallbackIllustration preferences={story.preferences} />
                          )}
                          {imageLoading ? (
                            <View style={styles.imageLoader}>
                              <ActivityIndicator color={colors.primary} size="large" />
                              <Text style={styles.imageLoaderText}>
                                {hasDynamicIllustrations && illustrationSource === 'dynamic'
                                  ? 'Creando la lámina del cuento…'
                                  : 'Buscando una lámina abierta…'}
                              </Text>
                            </View>
                          ) : null}
                          <Pressable accessibilityRole="button" onPress={refreshImage} style={styles.refreshButton}>
                            <Text style={styles.refreshText}>↻ Otra lámina</Text>
                          </Pressable>
                        </View>
                        {illustration && !imageFailed ? (
                          <Pressable
                            accessibilityRole={illustration.sourceUrl ? 'link' : 'text'}
                            disabled={!illustration.sourceUrl}
                            onPress={() => illustration.sourceUrl && Linking.openURL(illustration.sourceUrl)}
                            style={styles.attributionLink}
                          >
                            <Text style={styles.attribution}>
                              {illustration.provider === 'cloudflare'
                                ? 'Lámina mágica creada para este cuento'
                                : `“${illustration.title}” · ${illustration.creator} · ${illustration.license} · vía Openverse`}
                            </Text>
                          </Pressable>
                        ) : (
                          <Text style={styles.attribution}>Lámina local incluida en la aplicación</Text>
                        )}
                      </View>
                    </>
                  ) : null}

                  <View style={styles.tabs}>
                    <Pressable
                      accessibilityRole="tab"
                      accessibilityState={{ selected: activeTab === 'story' }}
                      onPress={() => selectTab('story')}
                      style={[styles.tab, activeTab === 'story' && styles.activeTab]}
                    >
                      <Text style={[styles.tabText, activeTab === 'story' && styles.activeTabText]}>▤ El cuento</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="tab"
                      accessibilityState={{ selected: activeTab === 'questions' }}
                      onPress={() => selectTab('questions')}
                      style={[styles.tab, activeTab === 'questions' && styles.activeTab]}
                    >
                      <Text style={[styles.tabText, activeTab === 'questions' && styles.activeTabText]}>
                        ? Preguntas ({story.questions.length})
                      </Text>
                    </Pressable>
                  </View>

                  {activeTab === 'story' && page ? (
                    <View style={styles.storyBody}>
                      <Text style={[styles.paragraph, { fontFamily }]}>
                        <Text style={styles.dropCap}>{page.paragraph.slice(0, 1)}</Text>
                        {page.paragraph.slice(1)}
                      </Text>
                      {isLastPage ? (
                        <View style={styles.moralBox}>
                          <Text style={styles.moralLabel}>LA SEMILLA DE ESTE CUENTO</Text>
                          <Text style={[styles.moral, { fontFamily }]}>{story.moral}</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.questionsBox}>
                      <Text style={styles.questionsIntro}>Preguntas para conversar sin prisa al terminar la lectura.</Text>
                      {story.questions.map((question, index) => (
                        <View key={question} style={styles.questionCard}>
                          <View style={styles.questionNumber}><Text style={styles.questionNumberText}>{index + 1}</Text></View>
                          <Text style={styles.questionText}>{question}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {activeTab === 'story' ? (
                    <View style={styles.pagination}>
                      <Pressable
                        accessibilityLabel="Página anterior"
                        accessibilityRole="button"
                        accessibilityState={{ disabled: isFirstPage }}
                        disabled={isFirstPage}
                        onPress={goBack}
                        style={[styles.pageButton, styles.previousButton, isFirstPage && styles.disabledButton]}
                      >
                        <Text style={styles.previousButtonText}>‹ Anterior</Text>
                      </Pressable>
                      <Text accessibilityLiveRegion="polite" style={styles.paginationLabel}>Página {page?.number ?? 1} de {pages.length}</Text>
                      <Pressable accessibilityRole="button" onPress={goForward} style={[styles.pageButton, styles.nextButton]}>
                        <Text style={styles.nextButtonText}>{isLastPage ? 'Preguntas  ›' : 'Siguiente  ›'}</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </View>

        {illustration?.provider === 'openverse' ? (
          <Text style={styles.openverseNotice}>Imágenes proporcionadas por la API de Openverse. Esta aplicación no está avalada por Openverse.</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 72, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  headerIconText: { color: colors.ink, fontSize: 34, lineHeight: 38 },
  headerBookIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerBrandLogo: { width: 42, height: 42 },
  headerTitle: { flex: 1, color: colors.ink, fontFamily: 'Quicksand', fontWeight: '800', fontSize: 17, textAlign: 'center' },
  newStoryButton: { minHeight: 48, justifyContent: 'center', borderRadius: radii.pill, backgroundColor: colors.primary, paddingHorizontal: 12 },
  newStoryText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  disabledButton: { opacity: 0.38 },
  toolbar: { minHeight: 66, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 9 },
  pageStatus: { flex: 1, minHeight: 48, borderRadius: radii.pill, backgroundColor: colors.surfaceWarm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 12 },
  pageStatusIcon: { color: colors.primary, fontSize: 18 },
  pageStatusText: { color: colors.primaryDark, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  audioButton: { minHeight: 48, borderRadius: radii.pill, backgroundColor: colors.primarySoft, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  audioButtonActive: { backgroundColor: colors.primary },
  audioButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  audioButtonTextActive: { color: colors.white },
  scrollContent: { padding: 10, paddingBottom: 36, gap: 12, width: '100%', maxWidth: 780, alignSelf: 'center' },
  readingDesk: { borderRadius: radii.large, backgroundColor: colors.surfaceWarm, padding: 8, shadowColor: colors.shadow, shadowOpacity: 0.13, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  bookCover: { borderRadius: 18, backgroundColor: '#253E2D', padding: 7, shadowColor: '#142318', shadowOpacity: 0.34, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
  gildedTrim: { borderRadius: 14, backgroundColor: '#9B6B28', padding: 3 },
  pageStack: { position: 'relative', borderRadius: 12, backgroundColor: '#D9D1BC', paddingTop: 4, paddingLeft: 4, paddingRight: 13, paddingBottom: 13, overflow: 'hidden' },
  pageStackSide: { position: 'absolute', top: 8, right: 2, bottom: 13, width: 10, backgroundColor: '#E9E0CB', justifyContent: 'space-evenly', paddingVertical: 4 },
  pageStackBottom: { position: 'absolute', left: 8, right: 13, bottom: 2, height: 10, backgroundColor: '#E9E0CB', justifyContent: 'space-evenly', paddingHorizontal: 3 },
  pageEdgeLine: { height: 1, backgroundColor: '#B9A98B', opacity: 0.72 },
  paperPage: { zIndex: 2, minHeight: 560, borderRadius: 10, backgroundColor: '#FDFAF2', paddingTop: 18, paddingRight: 22, paddingBottom: 20, paddingLeft: 32, overflow: 'hidden', shadowColor: '#72572E', shadowOpacity: 0.14, shadowRadius: 5, shadowOffset: { width: 3, height: 4 }, elevation: 2 },
  pageGutter: { zIndex: 1, position: 'absolute', top: 0, bottom: 0, left: 0, width: 12, backgroundColor: '#DED3BD', opacity: 0.42 },
  pageBackground: { position: 'absolute', inset: 0 },
  pageBackgroundImage: { position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.16 },
  pageBackgroundWash: { position: 'absolute', inset: 0, backgroundColor: 'rgba(253,250,242,0.80)' },
  storyHeading: { alignItems: 'center', paddingTop: 4, paddingHorizontal: 10, gap: 7 },
  ornament: { color: colors.gold, textAlign: 'center', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  storyTitle: { color: colors.primaryDark, textAlign: 'center', fontSize: 28, lineHeight: 36 },
  storySubtitle: { color: colors.muted, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  illustrationPlate: { borderRadius: radii.medium, backgroundColor: colors.goldSoft, padding: 7, marginTop: 16 },
  illustrationFrame: { borderRadius: 12, overflow: 'hidden', position: 'relative' },
  illustration: { width: '100%', height: 224, backgroundColor: colors.surfaceWarm },
  imageLoader: { position: 'absolute', inset: 0, backgroundColor: 'rgba(253,250,242,0.88)', alignItems: 'center', justifyContent: 'center', gap: 10 },
  imageLoaderText: { color: colors.primaryDark, fontSize: 13, fontWeight: '700', textAlign: 'center', paddingHorizontal: 18 },
  refreshButton: { minHeight: 48, justifyContent: 'center', position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(253,250,242,0.94)', borderRadius: radii.pill, paddingHorizontal: 12 },
  refreshText: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  attributionLink: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  attribution: { color: colors.muted, textAlign: 'center', fontSize: 11, lineHeight: 16, fontStyle: 'italic', paddingVertical: 8 },
  tabs: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 16, marginBottom: 14 },
  tab: { minHeight: 48, flex: 1, maxWidth: 180, borderRadius: radii.pill, backgroundColor: colors.surfaceWarm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  activeTab: { backgroundColor: colors.primary },
  tabText: { color: colors.muted, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  activeTabText: { color: colors.white },
  storyBody: { gap: 20, paddingHorizontal: 6, paddingTop: 4 },
  paragraph: { color: colors.ink, fontSize: 23, lineHeight: 36, textAlign: 'left' },
  dropCap: { color: colors.primary, fontSize: 38, lineHeight: 40, fontWeight: '900' },
  moralBox: { borderRadius: radii.medium, backgroundColor: colors.primarySoft, padding: 16, gap: 8 },
  moralLabel: { color: colors.primary, textAlign: 'center', fontSize: 11, fontWeight: '900', letterSpacing: 0.8 },
  moral: { color: colors.primaryDark, textAlign: 'center', fontSize: 20, lineHeight: 28 },
  questionsBox: { gap: 12, paddingTop: 4 },
  questionsIntro: { color: colors.muted, textAlign: 'center', fontSize: 14, lineHeight: 21, marginBottom: 2 },
  questionCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.medium, backgroundColor: colors.surfaceWarm, padding: 14 },
  questionNumber: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' },
  questionNumberText: { color: colors.gold, fontWeight: '900' },
  questionText: { flex: 1, color: colors.ink, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  pagination: { marginTop: 24, paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  paginationLabel: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17, fontWeight: '800', textAlign: 'center' },
  pageButton: { minHeight: 48, minWidth: 94, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13 },
  previousButton: { backgroundColor: colors.surfaceWarm },
  previousButtonText: { color: colors.primaryDark, fontSize: 13, fontWeight: '800' },
  nextButton: { backgroundColor: colors.primary },
  nextButtonText: { color: colors.white, fontSize: 13, fontWeight: '900' },
  openverseNotice: { color: colors.muted, textAlign: 'center', fontSize: 11, lineHeight: 16, paddingHorizontal: 20 },
});
