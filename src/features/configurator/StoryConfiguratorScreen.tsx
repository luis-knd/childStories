/**
 * THESIS: Un libro de aventuras que niños, niñas y padres pueden preparar juntos.
 * OWN-WORLD: Papel pergamino, acciones bosque, selección salvia y detalles miel.
 * STORY: Elegir personajes, imaginar la aventura y crear un cuento para compartir.
 * FIRST VIEWPORT: Marca, invitación breve y personaje; acción persistente al pie.
 * FORM: Formulario continuo adaptado de Stitch; dirección delegada por el usuario.
 */
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  companions,
  environments,
  fonts,
  moralValues,
  protagonists,
  tones,
} from '../../domain/story/catalog';
import type { ParagraphLength, StoryPreferences } from '../../domain/story/types';
import { isStoryReady } from '../../domain/story/isStoryReady';
import { MaterialIcon, type MaterialIconName } from '../../ui/MaterialIcon';
import { AnimatedWand } from '../../ui/AnimatedWand';
import { environmentArtwork } from './environmentArtwork';
import { SectionCard } from '../../ui/SectionCard';
import { Stepper } from '../../ui/Stepper';
import { colors, radii } from '../../ui/theme';

interface StoryConfiguratorScreenProps {
  preferences: StoryPreferences;
  onChange: (preferences: StoryPreferences) => void;
  onCreate: () => void;
  onSurprise: () => void;
  creating?: boolean;
}

const paragraphLengths: Array<{ id: ParagraphLength; label: string }> = [
  { id: 'short', label: 'Breve' },
  { id: 'medium', label: 'Media' },
  { id: 'long', label: 'Larga' },
];

const valueIcons: Record<string, MaterialIconName> = {
  amistad: 'favorite', curiosidad: 'explore', valentia: 'shield',
  cuidado: 'pets', paciencia: 'hourglass_empty', gratitud: 'auto_awesome',
};

export function StoryConfiguratorScreen({
  preferences,
  onChange,
  onCreate,
  onSurprise,
  creating = false,
}: StoryConfiguratorScreenProps) {
  const [customCompanionDraft, setCustomCompanionDraft] = useState('');
  const [customEnvironmentDraft, setCustomEnvironmentDraft] = useState(preferences.customEnvironment ?? '');
  const [customValueDraft, setCustomValueDraft] = useState(preferences.customValue ?? '');
  useEffect(() => setCustomEnvironmentDraft(preferences.customEnvironment ?? ''), [preferences.customEnvironment]);
  useEffect(() => setCustomValueDraft(preferences.customValue ?? ''), [preferences.customValue]);
  const update = (changes: Partial<StoryPreferences>) =>
    onChange({ ...preferences, ...changes });

  const useCustomEnvironment = () => {
    const customEnvironment = customEnvironmentDraft.trim();
    if (customEnvironment) update({ environmentId: 'custom', customEnvironment });
  };
  const addCustomValue = () => {
    const customValue = customValueDraft.trim();
    if (customValue) update({ valueId: 'custom', customValue });
  };
  const chooseProtagonist = (name: string, age: number) => update({ protagonist: name, age });
  const selectedCompanions = preferences.companions ?? [];
  const toggleCatalogCompanion = (id: string) => {
    const alreadySelected = selectedCompanions.some((selection) => selection.id === id);
    const companions = alreadySelected
      ? selectedCompanions.filter((selection) => selection.id !== id)
      : [...selectedCompanions, { id }].slice(0, 4);
    update({ companions });
  };
  const addCustomCompanion = () => {
    const name = customCompanionDraft.trim();
    if (!name || selectedCompanions.length >= 4) return;
    update({ companions: [...selectedCompanions, { id: 'custom', name }] });
    setCustomCompanionDraft('');
  };
  const removeCustomCompanion = (name: string | undefined) => update({
    companions: selectedCompanions.filter(
      (selection) => selection.id !== 'custom' || selection.name !== name,
    ),
  });
  const canCreate = isStoryReady(preferences);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Image
            accessibilityIgnoresInvertColors
            resizeMode="contain"
            source={require('../../../assets/brand-logo.png')}
            style={styles.brandLogo}
          />
        </View>
        <View style={styles.brandCopy}>
          <Text style={styles.brandTitle}>El Jardín Secreto</Text>
          <Text style={styles.brandSubtitle}>Cuentos hechos en familia</Text>
        </View>
        <Pressable accessibilityRole="button" disabled={creating} onPress={onSurprise} style={styles.surpriseButton}>
          <MaterialIcon name="casino" size={20} color={colors.gold} /><Text style={styles.surpriseButtonText}>Sorpréndeme</Text>
        </Pressable>
      </View>

      <ScrollView
        pointerEvents={creating ? 'none' : 'auto'}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>CREA UN RECUERDO MÁGICO</Text>
          <Text style={styles.introTitle}>¿Quién vivirá la aventura de hoy?</Text>
          <Text style={styles.introText}>
            Elige quién viene, imagina un lugar y descubre una historia para compartir.
          </Text>
        </View>

        <SectionCard icon={<MaterialIcon name="face" />} title="Personaje principal" hint="De 3 a 15 años">
          <View style={styles.twoColumns}>
            <View style={styles.growingField}>
              <Text style={styles.fieldLabel}>Nombre del protagonista</Text>
              <TextInput
                accessibilityLabel="Nombre del protagonista"
                maxLength={24}
                onChangeText={(protagonist) => update({ protagonist })}
                placeholder="Escribe un nombre"
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={preferences.protagonist}
              />
            </View>
            <View style={styles.ageField}>
              <Stepper
                label="Edad del lector"
                maximum={15}
                minimum={3}
                onChange={(age) => update({ age })}
                suffix="años"
                value={preferences.age}
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>O elige de tus aventureros frecuentes:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.frequentRow}>
            {protagonists.map((character, index) => {
              const selected = preferences.protagonist === character.name && preferences.age === character.age;
              return (
                <Pressable key={character.name} accessibilityRole="button" accessibilityLabel={`${character.name}, ${character.age} años`} accessibilityState={{ selected }}
                  onPress={() => chooseProtagonist(character.name, character.age)} style={[styles.suggestionChip, selected && styles.companionSelected]}>
                  <View style={[styles.avatar, { backgroundColor: ['#FFD9DF', '#FFDFB9', '#E8DCFF'][index % 3] }]}>
                    <Text style={styles.avatarLetter}>{character.name.charAt(0)}</Text>
                  </View>
                  <Text style={styles.suggestionText}>{character.name} · {character.age}</Text>
                  {selected ? <MaterialIcon name="check" size={18} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </SectionCard>

        <SectionCard icon={<MaterialIcon name="pets" />} title="Acompañantes especiales" hint={`${selectedCompanions.length} de 4 elegidos`}>
          <View style={styles.customField}>
            <Text style={styles.fieldLabel}>Tu acompañante</Text>
            <View style={styles.addCompanionRow}>
              <TextInput
                accessibilityLabel="Acompañante personalizado"
                maxLength={60}
                onChangeText={setCustomCompanionDraft}
                onSubmitEditing={addCustomCompanion}
                placeholder="Mi abuela, un dragón pequeño..."
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                style={[styles.input, styles.companionInput]}
                value={customCompanionDraft}
              />
              <Pressable
                accessibilityRole="button"
                disabled={!customCompanionDraft.trim() || selectedCompanions.length >= 4}
                onPress={addCustomCompanion}
                style={[styles.addCompanionButton, (!customCompanionDraft.trim() || selectedCompanions.length >= 4) && styles.createButtonDisabled]}
              >
                <Text style={styles.addCompanionButtonText}>+ Añadir</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.chipGrid}>
            {selectedCompanions.map((selection, index) => {
              const label = selection.id === 'custom' ? selection.name : companions.find(({ id }) => id === selection.id)?.label;
              return (
                <Pressable key={`${selection.id}-${index}`} accessibilityRole="button" accessibilityLabel={`Quitar ${label}`}
                  onPress={() => selection.id === 'custom' ? removeCustomCompanion(selection.name) : toggleCatalogCompanion(selection.id)}
                  style={[styles.suggestionChip, styles.companionSelected]}>
                  <Text style={styles.suggestionText}>{label}</Text>
                  <View style={styles.removeMark}><MaterialIcon name="close" size={18} /></View>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.fieldLabel}>Sugerencias fantásticas:</Text>
          <View style={styles.chipGrid}>
            {companions.filter((companion) => !selectedCompanions.some(({ id }) => id === companion.id)).map((companion) => (
              <Pressable key={companion.id} accessibilityRole="button" accessibilityLabel={`Añadir ${companion.label}`}
                accessibilityState={{ disabled: selectedCompanions.length >= 4 }} disabled={selectedCompanions.length >= 4}
                onPress={() => toggleCatalogCompanion(companion.id)}
                style={[styles.suggestionChip, selectedCompanions.length >= 4 && styles.createButtonDisabled]}>
                <Text style={styles.suggestionText}>+ {companion.label}</Text>
              </Pressable>
            ))}
          </View>
          {selectedCompanions.length >= 4 ? (
            <Text accessibilityLiveRegion="polite" style={styles.fieldLabel}>Quita un acompañante para añadir otro.</Text>
          ) : null}
        </SectionCard>

        <SectionCard icon={<MaterialIcon name="explore" />} title="Lugar mágico" hint="Elige o crea uno" badge={preferences.environmentId === 'custom' && !preferences.customEnvironment?.trim() ? undefined : '1 seleccionado'}>
          <View style={styles.customField}>
            <Text style={styles.fieldLabel}>Escribe o inventa tu propio lugar</Text>
            <View style={styles.addCompanionRow}>
              <TextInput
                accessibilityLabel="Lugar mágico personalizado"
                maxLength={80}
                onChangeText={setCustomEnvironmentDraft}
                onSubmitEditing={useCustomEnvironment}
                returnKeyType="done"
                placeholder="Ej. Una casa del árbol"
                placeholderTextColor={colors.muted}
                style={[styles.input, styles.companionInput]}
                value={customEnvironmentDraft}
              />
              <Pressable accessibilityRole="button" accessibilityLabel="Usar lugar personalizado"
                accessibilityState={{ disabled: !customEnvironmentDraft.trim() }} disabled={!customEnvironmentDraft.trim()}
                onPress={useCustomEnvironment} style={[styles.inlineAction, !customEnvironmentDraft.trim() && styles.createButtonDisabled]}>
                <MaterialIcon name="check" size={20} color={colors.white} />
                <Text style={styles.addCompanionButtonText}>Usar</Text>
              </Pressable>
            </View>
            {preferences.environmentId === 'custom' && preferences.customEnvironment?.trim() ? (
              <Text accessibilityLiveRegion="polite" style={styles.settingValue}>Lugar elegido: {preferences.customEnvironment}</Text>
            ) : null}
          </View>
          <Text style={styles.fieldLabel}>O elige uno de nuestros mundos mágicos:</Text>
          <View style={styles.environmentGrid}>
            {environments.filter((_, index) => index % 2 === 0).map((first, rowIndex) => (
              <View key={first.id} style={styles.environmentRow}>
                {environments.slice(rowIndex * 2, rowIndex * 2 + 2).map((environment) => {
                  const selected = preferences.environmentId === environment.id;
                  return (
                    <Pressable
                      key={environment.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => update({ environmentId: environment.id })}
                      style={[styles.environmentOption, selected && styles.filledSelected]}
                    >
                      <View style={styles.environmentImageFrame}>
                        <Image source={environmentArtwork[environment.id]?.source} resizeMode="cover" style={styles.environmentImage} />
                        {selected ? <View style={styles.selectionBadge}><MaterialIcon name="check" size={20} /></View> : null}
                      </View>
                      <Text style={[styles.largeOptionTitle, selected && styles.onFilled]}>{environment.shortName.charAt(0).toUpperCase() + environment.shortName.slice(1)}</Text>
                      <Text style={[styles.largeOptionDetail, selected && styles.onFilledDetail]}>{environmentArtwork[environment.id]?.caption}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard icon={<MaterialIcon name="menu_book" />} title="Objeto secreto & Enseñanza" hint="El corazón y la moraleja de la historia">
          <View style={styles.customField}>
            <Text style={styles.fieldLabel}>El amuleto o elemento clave</Text>
            <View style={styles.decoratedInput}>
              <MaterialIcon name="auto_awesome" size={24} color={colors.gold} />
              <TextInput
                accessibilityLabel="Objeto secreto"
                maxLength={100}
                multiline
                onChangeText={(magicItem) => update({ magicItem })}
                placeholder="Una bola de polvo mágico"
                placeholderTextColor={colors.muted}
                style={styles.magicItemInput}
                value={preferences.magicItem}
              />
            </View>
          </View>
          <Text style={styles.valuePrompt}>¿Qué valor florecerá hoy?</Text>
          <View style={styles.chipGrid}>
            {moralValues.map((value) => {
              const selected = preferences.valueId === value.id;
              return (
                <Pressable key={value.id} accessibilityRole="button" accessibilityLabel={value.label} accessibilityState={{ selected }}
                  onPress={() => update({ valueId: value.id })} style={[styles.valueChip, selected && styles.filledSelected]}>
                  <MaterialIcon name={selected ? 'check' : valueIcons[value.id] ?? 'favorite'} size={21} color={selected ? colors.white : colors.gold} />
                  <Text style={[styles.suggestionText, selected && styles.onFilled]}>{value.label}</Text>
                </Pressable>
              );
            })}
            {preferences.customValue?.trim() ? (
              <Pressable accessibilityRole="button" accessibilityLabel={`Enseñanza: ${preferences.customValue}`}
                accessibilityState={{ selected: preferences.valueId === 'custom' }}
                onPress={() => update({ valueId: 'custom' })}
                style={[styles.valueChip, preferences.valueId === 'custom' && styles.filledSelected]}>
                <MaterialIcon name={preferences.valueId === 'custom' ? 'check' : 'edit_note'} size={21} color={preferences.valueId === 'custom' ? colors.white : colors.gold} />
                <Text style={[styles.suggestionText, preferences.valueId === 'custom' && styles.onFilled]}>{preferences.customValue}</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.customField}>
            <Text style={styles.fieldLabel}>O escribe tu propio valor o enseñanza</Text>
            <View style={styles.addCompanionRow}>
              <View style={[styles.decoratedInput, styles.companionInput]}>
                <MaterialIcon name="edit_note" size={22} color={colors.muted} />
                <TextInput accessibilityLabel="Valor o enseñanza personalizada" maxLength={80}
                  onChangeText={setCustomValueDraft} onSubmitEditing={addCustomValue} returnKeyType="done"
                  placeholder="Ej. Empatía, Gratitud…" placeholderTextColor={colors.muted}
                  style={styles.customValueInput} value={customValueDraft} />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Añadir enseñanza personalizada"
                accessibilityState={{ disabled: !customValueDraft.trim() }} disabled={!customValueDraft.trim()}
                onPress={addCustomValue} style={[styles.inlineAction, !customValueDraft.trim() && styles.createButtonDisabled]}>
                <Text style={styles.addCompanionButtonText}>+ Añadir</Text>
              </Pressable>
            </View>
          </View>
        </SectionCard>

        <SectionCard icon={<MaterialIcon name="nights_stay" />} title="Tono del cuento">
          <View style={styles.toneRow}>
            {tones.map((tone) => {
              const selected = preferences.toneId === tone.id;
              return (
                <Pressable
                  key={tone.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => update({ toneId: tone.id })}
                  style={[styles.toneOption, selected && styles.toneOptionSelected]}
                >
                  <Text style={styles.toneEmoji}>{tone.emoji}</Text>
                  <Text style={[styles.toneLabel, selected && styles.selectedText]}>{selected ? '✓ ' : ''}{tone.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard icon={<MaterialIcon name="format_size" />} title="Estructura & Tipografía" hint="Personaliza el formato de lectura">
          <View style={styles.settingHeading}>
            <Text style={styles.settingLabel}>LONGITUD DEL CUENTO</Text>
            <Text style={styles.settingValue}>{preferences.paragraphCount} páginas</Text>
          </View>
          <View style={styles.segmentRow}>
            {[2, 3, 4, 5].map((count) => (
              <Pressable key={count} accessibilityRole="button" accessibilityState={{ selected: preferences.paragraphCount === count }}
                onPress={() => update({ paragraphCount: count })} style={[styles.segment, preferences.paragraphCount === count && styles.filledSelected]}>
                <Text style={[styles.segmentText, preferences.paragraphCount === count && styles.onFilled]}>{count} páginas</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.settingHeading}>
            <Text style={styles.settingLabel}>EXTENSIÓN DE CADA PÁGINA</Text>
            <Text style={styles.settingValue}>{paragraphLengths.find(({ id }) => id === preferences.paragraphLength)?.label}</Text>
          </View>
          <View style={styles.segmentRow}>
            {paragraphLengths.map((length) => (
              <Pressable key={length.id} accessibilityRole="button" accessibilityState={{ selected: preferences.paragraphLength === length.id }}
                onPress={() => update({ paragraphLength: length.id })} style={[styles.segment, preferences.paragraphLength === length.id && styles.filledSelected]}>
                <Text style={[styles.segmentText, preferences.paragraphLength === length.id && styles.onFilled]}>{length.label}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.settingLabel}>TIPOGRAFÍA PARA EL CUENTO</Text>
          <View style={styles.fontGrid}>
            {fonts.map((font) => {
              const selected = preferences.fontId === font.id;
              return (
                <Pressable key={font.id} accessibilityRole="button" accessibilityLabel={`Fuente ${font.label}`} accessibilityState={{ selected }}
                  onPress={() => update({ fontId: font.id })} style={[styles.fontOption, selected && styles.filledSelected]}>
                  <Text style={[styles.fontName, selected && styles.onFilled]}>{selected ? '✓ ' : ''}{font.label}</Text>
                  <Text style={[styles.fontPreview, { fontFamily: font.family }, selected && styles.onFilled]}>Un jardín lleno de magia</Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

      </ScrollView>
      <View style={styles.createDock}>
        {!canCreate ? <Text accessibilityLiveRegion="polite" style={styles.validationHint}>Añade un nombre, un acompañante y un objeto. Si inventas un lugar o una enseñanza, escribe también su nombre.</Text> : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canCreate || creating, busy: creating }}
          disabled={!canCreate || creating}
          onPress={onCreate}
          style={({ pressed }) => [
            styles.createButton,
            (!canCreate || creating) && styles.createButtonDisabled,
            pressed && canCreate && !creating && styles.createButtonPressed,
          ]}
        >
          <View style={styles.createTitleRow}>
            {creating ? <ActivityIndicator color={colors.white} /> : <AnimatedWand active={canCreate} />}
            <Text style={styles.createButtonText}>
              {creating ? 'Cultivando la historia…' : 'Crear mi cuento'}
            </Text>
            <MaterialIcon name="auto_awesome" size={28} color={colors.goldSoft} />
          </View>
          <Text style={styles.createButtonHint}>Una aventura para leer y escuchar</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 80,
    flexWrap: 'wrap',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogo: { width: 48, height: 48 },
  brandCopy: { flex: 1, minWidth: 150 },
  brandTitle: { color: colors.ink, fontFamily: 'Quicksand', fontSize: 16, fontWeight: '800' },
  brandSubtitle: { color: colors.muted, fontSize: 14 },
  surpriseButton: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  surpriseButtonText: { color: colors.gold, fontSize: 15, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 24, gap: 20, width: '100%', maxWidth: 720, alignSelf: 'center' },
  intro: { paddingHorizontal: 8, paddingVertical: 16, alignItems: 'center', gap: 7 },
  eyebrow: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  introTitle: { color: colors.primary, fontFamily: 'Caveat', fontSize: 40, lineHeight: 38, textAlign: 'center' },
  introText: { color: colors.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 430 },
  twoColumns: { gap: 16 },
  growingField: { flex: 1, gap: 7 },
  ageField: { width: '100%' },
  fieldLabel: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 14,
  },
  customField: { gap: 7, marginBottom: 3 },
  addCompanionRow: { flexDirection: 'row', gap: 8 },
  companionInput: { flex: 1, minWidth: 0 },
  inlineAction: { minHeight: 48, flexDirection: 'row', gap: 6, borderRadius: radii.medium, backgroundColor: colors.primary, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  decoratedInput: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, paddingHorizontal: 13, backgroundColor: colors.surface, minHeight: 56 },
  magicItemInput: { flex: 1, minWidth: 0, paddingVertical: 14, color: colors.ink, fontSize: 16 },
  customValueInput: { flex: 1, minWidth: 0, paddingVertical: 14, color: colors.ink, fontSize: 14 },
  valuePrompt: { color: colors.muted, fontSize: 15, fontWeight: '700', marginTop: 8 },
  valueChip: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, maxWidth: '100%' },
  addCompanionButton: {
    minHeight: 48,
    borderRadius: radii.medium,
    backgroundColor: colors.primary,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCompanionButtonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  frequentRow: { gap: 8, paddingVertical: 2 },
  suggestionChip: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: '#FCEBDD', borderWidth: 1, borderColor: 'transparent', maxWidth: '100%' },
  suggestionText: { color: colors.ink, fontSize: 14, fontWeight: '600', flexShrink: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: colors.ink, fontSize: 17, fontWeight: '700' },
  companionSelected: { backgroundColor: colors.primarySoft, borderColor: colors.border },
  removeMark: { backgroundColor: colors.border, borderRadius: 12, padding: 2 },
  environmentGrid: { gap: 10 },
  environmentRow: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  environmentOption: { flex: 1, minWidth: 0, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radii.medium, padding: 10, gap: 7, backgroundColor: colors.surface },
  environmentImageFrame: { width: '100%', aspectRatio: 1.5, borderRadius: 9, overflow: 'hidden' },
  environmentImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  selectionBadge: { position: 'absolute', top: 6, right: 6, padding: 5, borderRadius: 20, backgroundColor: colors.goldSoft },
  filledSelected: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  onFilled: { color: colors.white },
  onFilledDetail: { color: colors.primarySoft },
  settingHeading: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 6 },
  settingLabel: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  settingValue: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  segment: { flex: 1, minWidth: 56, minHeight: 48, paddingHorizontal: 4, paddingVertical: 10, borderRadius: 9, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  segmentText: { color: colors.ink, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  fontGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  largeOptionTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  largeOptionDetail: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  selectedText: { color: colors.primaryDark },
  toneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toneOption: {
    flex: 1,
    minHeight: 88,
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  toneOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  toneEmoji: { fontSize: 22 },
  toneLabel: { color: colors.muted, fontSize: 14, fontWeight: '700' },
  fontOption: {
    width: '30%', flexGrow: 1, minWidth: 85, minHeight: 128, backgroundColor: colors.surface, gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    paddingHorizontal: 14,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  fontPreview: { color: colors.ink, fontSize: 20, textAlign: 'center' },
  fontName: { color: colors.muted, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  createDock: { padding: 16, gap: 8, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, width: '100%', maxWidth: 720, alignSelf: 'center' },
  validationHint: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  createButton: {
    minHeight: 100,
    paddingHorizontal: 14, paddingVertical: 16,
    borderRadius: radii.large,
    backgroundColor: colors.primary,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  createButtonPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  createButtonDisabled: { opacity: 0.46 },
  createTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  createButtonText: { color: colors.white, fontSize: 22, fontWeight: '800', flexShrink: 1, textAlign: 'center' },
  createButtonHint: { color: colors.white, fontSize: 14, textAlign: 'center' },
});
