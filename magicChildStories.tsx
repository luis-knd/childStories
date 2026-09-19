import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Volume2, 
  VolumeX,
  RefreshCw, 
  Sliders, 
  Upload, 
  Square, 
  Play,
  Pause,
  Image as ImageIcon, 
  Heart, 
  Wand2, 
  Printer, 
  Type, 
  HelpCircle,
  Dice5,
  Settings2,
  CheckCircle2,
  Key,
  Info,
  RotateCcw,
  Palette
} from 'lucide-react';

const DEFAULT_CHARACTERS = [
  { name: 'Valentina', age: 7, desc: 'Una niña de ojos vivaces con cinta violeta en el pelo' },
  { name: 'Mateo', age: 8, desc: 'Un niño curioso que siempre lleva una lupa en su chaqueta' },
  { name: 'Sofía', age: 6, desc: 'Una niña risueña a quien le fascina hablar con los pájaros' },
  { name: 'Leo', age: 9, desc: 'Un pequeño explorador con botas de lluvia y cuaderno de mapas' },
  { name: 'Emma', age: 5, desc: 'Una pequeña risueña que colecciona hojas con forma de corazón' },
  { name: 'Lucas', age: 10, desc: 'Un observador de estrellas que sueña con inventar cometas' },
  { name: 'Alma', age: 12, desc: 'Una joven lectora de mente despierta y corazón compasivo' },
  { name: 'Clara', age: 4, desc: 'Una pequeña con pecas de sol que canta a las mariposas' },
  { name: 'Diego', age: 14, desc: 'Un aprendiz de botánico que cuida los esquejes del bosque' }
];

const DEFAULT_ENVIRONMENTS = [
  { id: 'jardin', label: 'El Jardín Secreto de Rosas y Lavanda', desc: 'Enredaderas de rosas y arroyos cantarines' },
  { id: 'bosque', label: 'El Bosque de las Luciérnagas Doradas', desc: 'Árboles centenarios y senderos brillantes' },
  { id: 'isla', label: 'La Isla de las Caracolas Mágicas', desc: 'Orilla cristalina de arena perlada' },
  { id: 'nubes', label: 'El Castillo entre Nubes de Melocotón', desc: 'Torrecillas suaves en el cielo del atardecer' },
  { id: 'biblioteca', label: 'El Ático de los Libros Alados', desc: 'Un rincón acogedor de pergaminos voladores' },
  { id: 'cueva', label: 'La Caverna de las Amatistas Luminosas', desc: 'Gruta de cuarzos que emiten notas armónicas' }
];

const DEFAULT_COMPANIONS = [
  { id: 'sapo_andres', name: 'El Sapo Andrés', type: 'Un simpático sapito verde esmeralda con ojos vivaces y saltos ágiles' },
  { id: 'candelario', name: 'Candelario el Conejito', type: 'Un conejito blanco de patitas suaves y aroma a lavanda' },
  { id: 'pipa', name: 'Pipa la Mariposa Guía', type: 'Una mariposa diminuta que deja una estela de polvo dorado' },
  { id: 'lucas_zorro', name: 'Lucas el Zorrito', type: 'Un zorrito rojizo con bufanda esmeralda y corazón noble' },
  { id: 'miso', name: 'Miso el Gato Astrónomo', type: 'Un gato pelirrojo esponjoso que observa constelaciones' },
  { id: 'estrella', name: 'Estrellita de Bolsillo', type: 'Una pequeña chispa celeste que ilumina la palma de la mano' }
];

const DEFAULT_VALUES = [
  { id: 'amistad', label: 'La amistad, la empatía y la dulzura al compartir' },
  { id: 'curiosidad', label: 'La curiosidad y el asombro por descubrir la naturaleza' },
  { id: 'valentia', label: 'La valentía para dar el primer paso con serenidad' },
  { id: 'cuidado', label: 'El respeto y amor por las plantas y los pequeños animales' },
  { id: 'paciencia', label: 'La paciencia para contemplar cómo florecen los momentos bellos' },
  { id: 'gratitud', label: 'La gratitud por los pequeños detalles de cada día' }
];

const TONES = [
  { id: 'calm', label: 'Dulce y relajante (Ideal para antes de dormir)', icon: '🌙' },
  { id: 'fun', label: 'Alegre y juguetón (Con risas y magia)', icon: '✨' },
  { id: 'wonder', label: 'Misterio suave y asombro poético', icon: '🌟' }
];

function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function pcmToWavBlob(pcm16Data, sampleRate = 24000) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcm16Data.byteLength;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  new Uint8Array(buffer, 44).set(new Uint8Array(pcm16Data.buffer, pcm16Data.byteOffset, pcm16Data.byteLength));
  return new Blob([buffer], { type: 'audio/wav' });
}

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // Parámetros del cuento: Personaje principal y edad (3 a 15)
  const [protagonist, setProtagonist] = useState('Valentina');
  const [protagonistAge, setProtagonistAge] = useState(7);

  // Acompañante, entorno, enseñanza y objeto
  const [companion, setCompanion] = useState(DEFAULT_COMPANIONS[0].name);
  const [companionDetail, setCompanionDetail] = useState(DEFAULT_COMPANIONS[0].type);
  const [environment, setEnvironment] = useState(DEFAULT_ENVIRONMENTS[0].label);
  const [moralValue, setMoralValue] = useState(DEFAULT_VALUES[0].label);
  const [storyTone, setStoryTone] = useState(TONES[0].id);
  const [magicItem, setMagicItem] = useState('Una pequeña flor de margarita dorada con brillo de rocío');

  // Estructura
  const [numParagraphs, setNumParagraphs] = useState(3);
  const [linesPerParagraph, setLinesPerParagraph] = useState(5);

  // Tipografía y estética
  const [selectedFont, setSelectedFont] = useState('dancing');
  const [customFontLoaded, setCustomFontLoaded] = useState(false);
  const [customFontName, setCustomFontName] = useState('');
  const [customFontDataUrl, setCustomFontDataUrl] = useState('');
  const [fontSize, setFontSize] = useState(24);

  // Cuento actual en pantalla
  const [story, setStory] = useState({
    title: 'El Sapo Andrés y el Sendero de las Rosas',
    protagonistUsed: 'Valentina',
    protagonistAgeUsed: 7,
    companionUsed: 'El Sapo Andrés',
    companionDetailUsed: 'Un simpático sapito verde esmeralda con ojos vivaces y saltos ágiles',
    environmentUsed: 'El Jardín Secreto de Rosas y Lavanda',
    magicItemUsed: 'Una pequeña flor de margarita dorada con brillo de rocío',
    paragraphs: [
      'Una tarde tibia y soleada, mientras Valentina curioseaba entre los rosales en flor, escuchó un suave y alegre croar junto a las campanillas. Sobre una piedra redonda de musgo fresco descansaba el Sapo Andrés, un simpático anfibio verde esmeralda con ojos vivaces y grandes saltos ágiles. Con un guiño travieso, Andrés señaló un sendero secreto donde la hierba crujía con suaves notas musicales bajo sus pies.',
      'Juntos avanzaron a saltitos y pasos delicados bordeando los capullos de lavanda que despedían un perfume dulce hacia el cielo. Andrés saltaba de una hoja a otra con elegante agilidad, mientras una cuadrilla de diminutas mariquitas iluminaba el camino con linternas de ámbar tibio. Valentina sonrió de felicidad al descubrir que en aquel rincón la naturaleza florecía más hermosa cuando se la cuidaba con paciencia y respeto.',
      'Al llegar al borde de un estanque de agua cristalina, el sapito Andrés apoyó sus patitas sobre un nenúfar que brilló con destellos de oro puro. Agradecida por tan hermoso paseo junto a su nuevo amigo anfibio, Valentina prometió proteger siempre a todos los seres vivos del jardín antes de regresar a casa. Con el corazón lleno de serenidad y dulces recuerdos, supo que siempre tendría un rincón de paz esperándola.'
    ],
    questions: [
      '¿Dónde descansaba el Sapo Andrés cuando Valentina lo encontró?',
      '¿De qué manera iluminaron las mariquitas el sendero de lavanda?',
      '¿Qué hermosa promesa hizo Valentina junto al estanque de agua cristalina?'
    ],
    moral: 'Los rincones más bellos del mundo se abren a quienes tratan a todos los seres vivos con dulzura, paciencia y respeto.'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('story');

  // Lámina ilustrada con Gemini 3.1 Flash Image
  const [imageUrl, setImageUrl] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imagePromptUsed, setImagePromptUsed] = useState('');

  // Reproductor de Voz y Narración
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [currentNarratingParagraph, setCurrentNarratingParagraph] = useState(-1);
  const [audioStatusText, setAudioStatusText] = useState('');
  
  const audioElementRef = useRef(null);
  const activeUtteranceRef = useRef(null);

  useEffect(() => {
    const savedKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : '';
    if (savedKey) setApiKey(savedKey);

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Dancing+Script:wght@500;600;700&family=Marck+Script&family=Quicksand:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Generar la ilustración inicial
    generateGeminiIllustration(story);

    return () => {
      stopAudio();
      try {
        document.head.removeChild(link);
      } catch (e) {}
    };
  }, []);

  const resolveProtagonistData = () => {
    const trimmed = protagonist.trim();
    if (trimmed) {
      return { name: trimmed, age: protagonistAge || 7 };
    }
    const randomChar = DEFAULT_CHARACTERS[Math.floor(Math.random() * DEFAULT_CHARACTERS.length)];
    return {
      name: randomChar.name,
      age: protagonistAge || randomChar.age
    };
  };

  const resolveCompanion = () => {
    const trimmedComp = companion.trim();
    if (trimmedComp) {
      const lower = trimmedComp.toLowerCase();
      const matchedPreset = DEFAULT_COMPANIONS.find(c => c.name.toLowerCase() === lower);
      if (matchedPreset) {
        return {
          name: trimmedComp,
          detail: companionDetail.trim() || matchedPreset.type
        };
      }
      
      let detectedType = 'Un entrañable compañero leal y cariñoso';
      if (lower.includes('sapo') || lower.includes('rana')) {
        detectedType = 'Un simpático y vivaz sapito verde esmeralda con ojos grandes, saltos ágiles y hojas de nenúfar';
      } else if (lower.includes('gato') || lower.includes('miso')) {
        detectedType = 'Un tierno gato curioso de suave pelaje y ronroneo dulce';
      } else if (lower.includes('zorro')) {
        detectedType = 'Un noble zorrito rojizo de cola esponjosa y corazón leal';
      } else if (lower.includes('conejo')) {
        detectedType = 'Un conejito blanco de orejas suaves y aroma a lavanda';
      } else if (companionDetail.trim()) {
        detectedType = companionDetail.trim();
      }

      return {
        name: trimmedComp,
        detail: detectedType
      };
    }
    const randomComp = DEFAULT_COMPANIONS[Math.floor(Math.random() * DEFAULT_COMPANIONS.length)];
    return {
      name: randomComp.name,
      detail: randomComp.type
    };
  };

  const resolveEnvironment = () => {
    const trimmedEnv = environment.trim();
    if (trimmedEnv) return trimmedEnv;
    const randomEnv = DEFAULT_ENVIRONMENTS[Math.floor(Math.random() * DEFAULT_ENVIRONMENTS.length)];
    return randomEnv.label;
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', key);
    }
    setShowApiKeyModal(false);
  };

  const handleFontUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fontName = 'CustomFont_' + Date.now();
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const fontDataUrl = e.target.result;
          setCustomFontDataUrl(fontDataUrl);
          const fontFace = new FontFace(fontName, `url(${fontDataUrl})`);
          await fontFace.load();
          document.fonts.add(fontFace);
          setCustomFontName(fontName);
          setSelectedFont('custom');
          setCustomFontLoaded(true);
        } catch (err) {
          setErrorMsg('No se pudo cargar la fuente. Por favor, sube un archivo .ttf u .otf válido.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSurpriseMe = () => {
    const randomChar = DEFAULT_CHARACTERS[Math.floor(Math.random() * DEFAULT_CHARACTERS.length)];
    const randomComp = DEFAULT_COMPANIONS[Math.floor(Math.random() * DEFAULT_COMPANIONS.length)];
    const randomEnv = DEFAULT_ENVIRONMENTS[Math.floor(Math.random() * DEFAULT_ENVIRONMENTS.length)];
    const randomVal = DEFAULT_VALUES[Math.floor(Math.random() * DEFAULT_VALUES.length)];
    const randomTone = TONES[Math.floor(Math.random() * TONES.length)];
    const items = [
      'Una pequeña flor de margarita dorada con rocío brillante',
      'Un reloj de arena que vierte purpurina azul de paz',
      'Una campanilla de cristal que suena como risas de hadas',
      'Un lazo de seda que brilla suavemente en la penumbra',
      'Una caracola perlada que susurra melodías de calma'
    ];
    const randomItem = items[Math.floor(Math.random() * items.length)];

    setProtagonist(randomChar.name);
    setProtagonistAge(randomChar.age);
    setCompanion(randomComp.name);
    setCompanionDetail(randomComp.type);
    setEnvironment(randomEnv.label);
    setMoralValue(randomVal.label);
    setStoryTone(randomTone.id);
    setMagicItem(randomItem);
  };

  const handleGenerateStory = async () => {
    setIsLoading(true);
    setErrorMsg('');
    stopAudio();

    const charData = resolveProtagonistData();
    const activeCompanionObj = resolveCompanion();
    const activeEnvironment = resolveEnvironment();
    const selectedToneObj = TONES.find(t => t.id === storyTone) || TONES[0];
    const approxWordsPerLine = 10;
    const targetWordsPerParagraph = linesPerParagraph * approxWordsPerLine;

    const ageGuidance = charData.age <= 5
      ? 'narrativa muy tierna, rítmica, sensorial y reconfortante para primera infancia'
      : charData.age <= 9
      ? 'aventura mágica de asombro infantil, curiosidad activa y amistad entrañable'
      : 'relato poético, reflexivo y evocador con toques de fantasía lírica y autodescubrimiento juvenil';

    const systemPrompt = `Eres una tierna escritora de literatura en español adaptada a lectores de ${charData.age} años (${ageGuidance}).
REGLAS ESTRICTAS:
1. Exactamente ${numParagraphs} párrafos.
2. Cada párrafo debe tener una extensión aproximada de ${targetWordsPerParagraph} palabras (~${linesPerParagraph} líneas).
3. Cada párrafo debe ser un bloque de texto fluido y continuo, sin saltos de línea internos.
4. IMPORTANTE SOBRE EL ACOMPAÑANTE: Respeta fielmente la naturaleza y especie biológica o mágica del acompañante indicado ("${activeCompanionObj.name}"). Si es un sapo o rana, debe comportarse, verse y describirse como un sapo o anfibio (piel verde o moteada, saltos, ojos saltones y tiernos, charcas o piedras húmedas), NUNCA lo confundas con un conejo, gato u otro animal.
5. Genera siempre un objeto JSON válido con title, paragraphs, moral y questions.`;

    const userPrompt = `Escribe un cuento ilustrado con los siguientes elementos:
- Personaje principal: ${charData.name} (${charData.age} años, tono adaptado a su edad)
- Acompañante entrañable: ${activeCompanionObj.name} (Descripción/Especie: ${activeCompanionObj.detail})
- Escenario mágico: ${activeEnvironment}
- Objeto secreto: ${magicItem}
- Valor formativo o enseñanza: ${moralValue.trim() || 'La empatía y el respeto por todos los seres vivos'}
- Tono: ${selectedToneObj.label}
- Estructura: Exactamente ${numParagraphs} párrafos de unas ${linesPerParagraph} líneas cada uno.
- Añade 3 preguntas dulces para conversar en familia al terminar.`;

    try {
      const activeKey = apiKey || '';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${activeKey}`;
      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              paragraphs: { type: "ARRAY", items: { type: "STRING" } },
              moral: { type: "STRING" },
              questions: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["title", "paragraphs", "moral", "questions"]
          }
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Respuesta vacía');

      const parsed = JSON.parse(rawText);
      const updatedStory = {
        ...parsed,
        protagonistUsed: charData.name,
        protagonistAgeUsed: charData.age,
        companionUsed: activeCompanionObj.name,
        companionDetailUsed: activeCompanionObj.detail,
        environmentUsed: activeEnvironment,
        magicItemUsed: magicItem
      };

      setStory(updatedStory);
      setActiveTab('story');
      generateGeminiIllustration(updatedStory);
    } catch (err) {
      // Generador de respaldo de alta calidad
      const isFrogOrToad = activeCompanionObj.name.toLowerCase().includes('sapo') || activeCompanionObj.name.toLowerCase().includes('rana');
      const companionAction = isFrogOrToad 
        ? `croaba con alegría saltando ágilmente sobre las piedras cubiertas de musgo húmedo`
        : `avanzaba feliz con pasos suaves y ojos llenos de asombro`;

      const fallbackTitle = `${charData.name} y ${activeCompanionObj.name} en ${activeEnvironment.split(' ')[1] || 'el Sendero Mágico'}`;
      const fallbackStory = {
        title: fallbackTitle,
        protagonistUsed: charData.name,
        protagonistAgeUsed: charData.age,
        companionUsed: activeCompanionObj.name,
        companionDetailUsed: activeCompanionObj.detail,
        environmentUsed: activeEnvironment,
        magicItemUsed: magicItem,
        paragraphs: Array.from({ length: numParagraphs }, (_, idx) => {
          if (idx === 0) {
            return `Una tarde tibia y luminosa, ${charData.name} caminaba con pasos suaves por ${activeEnvironment.toLowerCase()}, llevando con cuidado ${magicItem.toLowerCase()}. A su lado, ${activeCompanionObj.name} ${companionAction}, descubriendo juntos un sendero donde la hierba crujía con suaves notas musicales bajo sus pies con cada paso compartido.`;
          } else if (idx === numParagraphs - 1) {
            return `Al final del sendero, frente a un remanso de agua cristalina y hojas flotantes, ambos comprendieron que la mayor aventura es saber cuidar de quienes nos rodean con ternura y paciencia. Agradecida por tan hermoso día, ${charData.name} sonrió con afecto a su leal amigo y regresó a casa con el corazón tibio de alegría y recuerdos imborrables.`;
          }
          return `En lo más profundo de aquel rincón especial, una brisa suave trajo consigo el aroma de las flores silvestres. ${activeCompanionObj.name} dio un saltito travieso señalando una pequeña puerta de madera oculta entre las ramas, invitando a su amiga a mirar con ojos llenos de asombro y bondad cada pequeño milagro que la naturaleza les regalaba.`;
        }),
        questions: [
          `¿Qué objeto especial llevaba ${charData.name} durante su paseo?`,
          `¿De qué manera acompañó ${activeCompanionObj.name} a su amiga en el camino?`,
          `¿Qué aprendieron ambos al contemplar el hermoso rincón secreto?`
        ],
        moral: moralValue.trim() || 'Los rincones más bellos del mundo se abren a quienes miran con ojos de ternura, paciencia y respeto.'
      };

      setStory(fallbackStory);
      setActiveTab('story');
      generateGeminiIllustration(fallbackStory);
    } finally {
      setIsLoading(false);
    }
  };

  const generateGeminiIllustration = async (storyData) => {
    setIsGeneratingImage(true);

    const heroine = storyData.protagonistUsed || 'Valentina';
    const age = storyData.protagonistAgeUsed || 7;
    const comp = storyData.companionUsed || 'El Sapo Andrés';
    const env = storyData.environmentUsed || 'El Jardín Secreto';
    const item = storyData.magicItemUsed || 'una flor dorada';

    const compLow = comp.toLowerCase();
    const isFrogOrToad = compLow.includes('sapo') || compLow.includes('rana');
    const isCat = compLow.includes('gato') || compLow.includes('felino');
    const isFox = compLow.includes('zorro');

    let companionPromptDesc = `${comp}, a cute friendly little companion`;
    if (isFrogOrToad) {
      companionPromptDesc = `a charming, cute emerald-green little frog or toad named ${comp}, with big gentle eyes and smooth amphibian skin, happily sitting on a lily pad or mossy river stone, behaving strictly like a frog (NOT a rabbit or cat)`;
    } else if (isCat) {
      companionPromptDesc = `a sweet ginger tabby kitten named ${comp} with soft green eyes`;
    } else if (isFox) {
      companionPromptDesc = `a little red fox named ${comp} wearing a cozy emerald scarf`;
    }

    const promptText = `A stunning and delicate children's book watercolor illustration. Scene: A ${age}-year-old child named ${heroine} happily sharing a peaceful moment with ${companionPromptDesc} in ${env}. They are near ${item}. Vintage Beatrix Potter and Cicely Mary Barker storybook aesthetic, gentle watercolor washes on textured art paper, fine delicate ink contour lines, soft golden hour sunlight, botanical flowers, peaceful and heartwarming.`;
    setImagePromptUsed(promptText);

    try {
      const activeKey = apiKey || '';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${activeKey}`;
      const payload = {
        contents: [{
          role: 'user',
          parts: [{ text: promptText }]
        }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: "16:9" }
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const part = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part && part.inlineData?.data) {
          setImageUrl(`data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`);
          setIsGeneratingImage(false);
          return;
        }
      }
      throw new Error('Fallback to rich artistic vector illustration');
    } catch (err) {
      // Fallback a lámina vectorial rica con las características exactas del sapito o animal
      const fallbackSvg = createRichWatercolorSvg(heroine, comp, env, item, isFrogOrToad, isCat, isFox);
      setImageUrl(fallbackSvg);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const createRichWatercolorSvg = (heroine, comp, env, item, isFrogOrToad, isCat, isFox) => {
    let companionArt = '';
    if (isFrogOrToad) {
      companionArt = `
        <g transform="translate(470, 320)">
          <!-- Piedra de musgo y nenúfar de agua -->
          <ellipse cx="35" cy="70" rx="46" ry="16" fill="#1e293b" opacity="0.4" />
          <ellipse cx="35" cy="66" rx="42" ry="12" fill="#475569" />
          <ellipse cx="35" cy="64" rx="38" ry="9" fill="#15803d" />
          <!-- Patas traseras y cuerpo del sapo -->
          <ellipse cx="10" cy="54" rx="15" ry="9" fill="#166534" />
          <ellipse cx="60" cy="54" rx="15" ry="9" fill="#166534" />
          <ellipse cx="35" cy="46" rx="28" ry="22" fill="#22c55e" stroke="#15803d" stroke-width="2.5" />
          <ellipse cx="35" cy="50" rx="18" ry="13" fill="#fef08a" opacity="0.9" />
          <!-- Ojos grandes y saltones -->
          <circle cx="20" cy="26" r="12" fill="#22c55e" stroke="#15803d" stroke-width="2" />
          <circle cx="50" cy="26" r="12" fill="#22c55e" stroke="#15803d" stroke-width="2" />
          <circle cx="20" cy="26" r="8" fill="#fef08a" />
          <circle cx="50" cy="26" r="8" fill="#fef08a" />
          <circle cx="21" cy="26" r="4.5" fill="#0f172a" />
          <circle cx="49" cy="26" r="4.5" fill="#0f172a" />
          <circle cx="19" cy="24" r="2" fill="#ffffff" />
          <circle cx="47" cy="24" r="2" fill="#ffffff" />
          <!-- Sonrisa alegre y mejillas -->
          <path d="M 23 41 Q 35 48 47 41" stroke="#14532d" stroke-width="2.5" stroke-linecap="round" fill="none" />
          <circle cx="16" cy="42" r="3.5" fill="#f43f5e" opacity="0.5" />
          <circle cx="54" cy="42" r="3.5" fill="#f43f5e" opacity="0.5" />
        </g>
      `;
    } else if (isCat) {
      companionArt = `
        <g transform="translate(470, 325)">
          <ellipse cx="28" cy="50" rx="20" ry="16" fill="#fb923c" stroke="#c2410c" stroke-width="2" />
          <circle cx="28" cy="30" r="16" fill="#fb923c" stroke="#c2410c" stroke-width="2" />
          <polygon points="14,22 19,8 25,19" fill="#ea580c" />
          <polygon points="31,19 37,8 42,22" fill="#ea580c" />
          <circle cx="22" cy="29" r="2.5" fill="#431407" />
          <circle cx="34" cy="29" r="2.5" fill="#431407" />
          <path d="M 48 54 Q 62 48 56 36" stroke="#c2410c" stroke-width="4" stroke-linecap="round" fill="none" />
        </g>
      `;
    } else {
      companionArt = `
        <g transform="translate(470, 325)">
          <ellipse cx="28" cy="50" rx="22" ry="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
          <circle cx="28" cy="30" r="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
          <circle cx="22" cy="29" r="2.5" fill="#334155" />
          <circle cx="34" cy="29" r="2.5" fill="#334155" />
        </g>
      `;
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="100%" height="100%">
        <defs>
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#fef3c7" />
            <stop offset="50%" stop-color="#fce7f3" />
            <stop offset="100%" stop-color="#e0e7ff" />
          </linearGradient>
          <linearGradient id="grass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#86efac" />
            <stop offset="100%" stop-color="#15803d" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="960" height="540" fill="url(#sky)" />
        <circle cx="480" cy="140" r="100" fill="#fffbeb" opacity="0.8" filter="url(#softGlow)" />
        <circle cx="480" cy="140" r="45" fill="#fef08a" opacity="0.9" />

        <path d="M 0 320 Q 240 220 480 290 T 960 270 L 960 540 L 0 540 Z" fill="url(#grass)" opacity="0.85" />
        <path d="M 0 370 Q 340 310 680 380 T 960 360 L 960 540 L 0 540 Z" fill="#166534" opacity="0.9" />

        <!-- Sendero de flores y piedras -->
        <path d="M 480 320 Q 450 420 370 540" stroke="#fef08a" stroke-width="45" stroke-linecap="round" fill="none" opacity="0.75" />

        <!-- Personaje -->
        <g transform="translate(380, 250)">
          <ellipse cx="28" cy="18" rx="20" ry="8" fill="#fb7185" opacity="0.8" />
          <circle cx="28" cy="36" r="19" fill="#78350f" />
          <circle cx="30" cy="38" r="15" fill="#fed7aa" />
          <circle cx="35" cy="37" r="2.5" fill="#4c0519" />
          <path d="M 18 54 Q 30 48 44 54 L 58 116 Q 30 126 4 116 Z" fill="#e11d48" />
          <path d="M 22 66 Q 42 78 56 72" stroke="#fed7aa" stroke-width="6" stroke-linecap="round" fill="none" />
          <circle cx="58" cy="72" r="7" fill="#facc15" filter="url(#softGlow)" />
        </g>

        <!-- Acompañante con forma biológica fiel -->
        ${companionArt}

        <!-- Flores del entorno -->
        <g opacity="0.9">
          <circle cx="180" cy="350" r="12" fill="#f43f5e" /><circle cx="180" cy="350" r="4" fill="#fef08a" />
          <circle cx="260" cy="270" r="14" fill="#ec4899" /><circle cx="260" cy="270" r="5" fill="#fef08a" />
          <circle cx="720" cy="280" r="14" fill="#a855f7" /><circle cx="720" cy="280" r="5" fill="#fde047" />
          <circle cx="800" cy="360" r="12" fill="#f43f5e" /><circle cx="800" cy="360" r="4" fill="#fef08a" />
        </g>

        <rect x="180" y="480" width="600" height="38" rx="19" fill="#ffffff" opacity="0.95" stroke="#f3e8ff" stroke-width="1.5" />
        <text x="480" y="505" font-family="'Caveat', cursive, sans-serif" font-size="22" fill="#831843" text-anchor="middle" font-weight="bold">
          ${heroine} y ${comp} en ${env.split(' ')[1] || 'su paseo mágico'}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const stopAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtteranceRef.current = null;
    setIsPlayingAudio(false);
    setIsAudioLoading(false);
    setCurrentNarratingParagraph(-1);
    setAudioStatusText('');
  };

  const handleReadAloud = async () => {
    if (isPlayingAudio || isAudioLoading) {
      stopAudio();
      return;
    }

    setIsAudioLoading(true);
    setAudioStatusText('Preparando la voz cálida del cuento...');

    // Limpiar el texto para que fluya sin pausas raras
    const cleanTitle = story.title || 'Cuento Infantil';
    const cleanParagraphs = story.paragraphs.map(p => p.replace(/\.{3,}/g, ', ').replace(/[*_#]/g, ''));
    const cleanMoral = story.moral ? `Enseñanza: ${story.moral}` : '';
    const fullStoryScript = `${cleanTitle}. ${cleanParagraphs.join('. ')}. ${cleanMoral}`;

    // 1. Intentar con Gemini 2.5 Flash TTS
    try {
      const activeKey = apiKey || '';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${activeKey}`;
      const payload = {
        contents: [{
          parts: [{ text: `Lee con voz dulce, relajante y maternal para niños de ${story.protagonistAgeUsed || 7} años: ${fullStoryScript}` }]
        }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Aoede" }
            }
          }
        },
        model: "gemini-2.5-flash-preview-tts"
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;
        if (audioData) {
          const sampleRate = 24000;
          const pcmData = base64ToArrayBuffer(audioData);
          const pcm16 = new Int16Array(pcmData);
          const wavBlob = pcmToWavBlob(pcm16, sampleRate);
          const audioUrl = URL.createObjectURL(wavBlob);

          const audio = new Audio(audioUrl);
          audioElementRef.current = audio;
          audio.onended = () => {
            stopAudio();
          };
          audio.onerror = () => {
            playWithNativeSpeech(cleanParagraphs, cleanTitle, cleanMoral);
          };

          await audio.play();
          setIsAudioLoading(false);
          setIsPlayingAudio(true);
          setAudioStatusText('Narrando cuento con voz de Gemini');
          return;
        }
      }
      throw new Error('Fallback to native speech synthesis');
    } catch (err) {
      // 2. Respaldo infalible con SpeechSynthesis nativo sin sonidos extraños
      playWithNativeSpeech(cleanParagraphs, cleanTitle, cleanMoral);
    }
  };

  const playWithNativeSpeech = (paragraphs, title, moral) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsAudioLoading(false);
      setErrorMsg('Tu navegador no permite reproducir voz.');
      return;
    }

    window.speechSynthesis.cancel();

    const playlist = [
      { text: title, paragraphIndex: -1 },
      ...paragraphs.map((p, idx) => ({ text: p, paragraphIndex: idx })),
      ...(moral ? [{ text: moral, paragraphIndex: 99 }] : [])
    ];

    let currentIndex = 0;
    setIsAudioLoading(false);
    setIsPlayingAudio(true);

    const speakNextItem = () => {
      if (currentIndex >= playlist.length) {
        stopAudio();
        return;
      }

      const item = playlist[currentIndex];
      setCurrentNarratingParagraph(item.paragraphIndex);
      setAudioStatusText(`Leyendo: ${item.text.slice(0, 35)}...`);

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.88;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const esVoice = voices.find(v => v.lang && v.lang.startsWith('es') && (
        v.name.includes('Monica') || v.name.includes('Lucia') || v.name.includes('Helena') || v.name.includes('Google')
      )) || voices.find(v => v.lang && v.lang.startsWith('es'));

      if (esVoice) utterance.voice = esVoice;
      activeUtteranceRef.current = utterance;

      utterance.onend = () => {
        currentIndex++;
        speakNextItem();
      };

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          currentIndex++;
          speakNextItem();
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextItem();
  };

  const handlePrint = () => {
    try {
      const activeFontFamily = getFontStyle().fontFamily;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="utf-8">
              <title>${story.title}</title>
              <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Dancing+Script:wght@500;600;700&family=Marck+Script&family=Quicksand:wght@500;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap">
              <style>
                @page { size: A4; margin: 18mm; }
                ${customFontLoaded && customFontDataUrl ? `
                  @font-face {
                    font-family: '${customFontName}';
                    src: url('${customFontDataUrl}') format('truetype');
                    font-weight: normal;
                    font-style: normal;
                  }
                ` : ''}
                body {
                  font-family: ${activeFontFamily} !important;
                  background-color: #ffffff;
                  color: #292524;
                  margin: 0;
                  padding: 20px;
                }
                .book-container {
                  border: 2px solid #e7d8c9;
                  border-radius: 20px;
                  padding: 30px;
                  background: #fffdf9;
                  max-width: 750px;
                  margin: 0 auto;
                }
                .header-ornament {
                  text-align: center;
                  color: #e11d48;
                  font-size: 13px;
                  letter-spacing: 2px;
                  text-transform: uppercase;
                  margin-bottom: 12px;
                }
                h1 {
                  text-align: center;
                  font-size: 32px;
                  color: #4c0519;
                  margin: 0 0 16px 0;
                  font-family: ${activeFontFamily} !important;
                }
                .img-box { text-align: center; margin: 16px 0; }
                .img-box img { max-width: 85%; max-height: 260px; border-radius: 14px; object-fit: cover; }
                .paragraph {
                  font-size: ${fontSize}px;
                  line-height: 1.75;
                  margin-bottom: 18px;
                  text-align: justify;
                  font-family: ${activeFontFamily} !important;
                }
                .moral-box {
                  margin-top: 22px;
                  padding: 14px 18px;
                  background-color: #fff1f2;
                  border-radius: 12px;
                  border: 1px dashed #f43f5e;
                  text-align: center;
                  font-style: italic;
                  color: #881337;
                  font-size: ${fontSize - 2}px;
                  font-family: ${activeFontFamily} !important;
                }
                .questions-box { margin-top: 26px; padding-top: 18px; border-top: 1px solid #e7d8c9; }
                .questions-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: bold; color: #44403c; margin-bottom: 8px; }
                .question-item { font-family: 'Quicksand', sans-serif; font-size: 13px; color: #57534e; margin-bottom: 6px; }
              </style>
            </head>
            <body>
              <div class="book-container">
                <div class="header-ornament">❦ El Rincón Mágico de ${story.protagonistUsed} (${story.protagonistAgeUsed} años) ❦</div>
                <h1>${story.title}</h1>
                ${imageUrl ? `<div class="img-box"><img src="${imageUrl}" alt="Ilustración" /></div>` : ''}
                ${story.paragraphs.map(p => `<p class="paragraph">${p}</p>`).join('')}
                ${story.moral ? `<div class="moral-box">"${story.moral}"</div>` : ''}
                ${story.questions && story.questions.length > 0 ? `
                  <div class="questions-box">
                    <div class="questions-title">Preguntas para conversar en familia:</div>
                    ${story.questions.map((q, i) => `<div class="question-item"><strong>${i + 1}.</strong> ${q}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        if (printWindow.document.fonts && printWindow.document.fonts.ready) {
          printWindow.document.fonts.ready.then(() => {
            printWindow.focus();
            printWindow.print();
          });
        } else {
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
          }, 600);
        }
      } else {
        window.print();
      }
    } catch (e) {
      window.print();
    }
  };

  const getFontStyle = () => {
    if (selectedFont === 'custom' && customFontLoaded) {
      return { fontFamily: `'${customFontName}', cursive, sans-serif` };
    }
    switch (selectedFont) {
      case 'dancing':
        return { fontFamily: "'Dancing Script', cursive" };
      case 'caveat':
        return { fontFamily: "'Caveat', cursive" };
      case 'marck':
        return { fontFamily: "'Marck Script', cursive" };
      case 'quicksand':
        return { fontFamily: "'Quicksand', sans-serif" };
      default:
        return { fontFamily: "'Dancing Script', cursive" };
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] text-stone-800 font-sans antialiased selection:bg-rose-200">
      
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 px-4 lg:px-8 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900 flex items-center gap-1.5 font-serif">
                El Jardín Secreto
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-sans font-semibold">
                  Cuentos Infantiles Mágicos
                </span>
              </h1>
              <p className="text-xs text-stone-500">Cuentos ilustrados adaptados de 3 a 15 años</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                apiKey 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>{apiKey ? 'API Conectada' : 'Configurar Clave'}</span>
            </button>

            <button
              onClick={handleSurpriseMe}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Dice5 className="w-3.5 h-3.5 text-amber-600" />
              <span>Sorpréndeme</span>
            </button>

            <button
              onClick={handleGenerateStory}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Tejiendo Cuento...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Crear Cuento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Modal para configurar API Key */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-stone-100">
              <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-rose-500" />
                Clave API de Google AI Studio
              </h3>
              <button onClick={() => setShowApiKeyModal(false)} className="text-stone-400 hover:text-stone-700 text-sm">✕</button>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Introduce tu clave para generar historias enriquecidas con Gemini 3 Flash e ilustraciones con Gemini 3.1 Flash Image. Si el entorno ya inyecta tu clave, puedes dejar este campo en blanco.
            </p>
            <input 
              type="password" 
              placeholder="AIzaSy..." 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowApiKeyModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-stone-600 hover:bg-stone-100 font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleSaveApiKey(apiKey)}
                className="px-4 py-1.5 rounded-xl text-xs bg-rose-500 hover:bg-rose-600 text-white font-bold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="font-bold underline ml-2">Cerrar</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Panel Izquierdo: Parámetros del Cuento */}
          <section className="lg:col-span-5 bg-white rounded-3xl p-5 shadow-xs border border-stone-200/70 space-y-5">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-500" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700">Pautas del Cuento</h2>
              </div>
              <span className="text-[11px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-medium">
                Personalizable a medida
              </span>
            </div>

            {/* 1. Personaje Principal y Edad (3 a 15) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Personaje Principal y Edad
                </label>
                <span className="text-[10px] text-stone-400 italic">O déjalo vacío para elegir al azar</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    value={protagonist}
                    onChange={(e) => setProtagonist(e.target.value)}
                    placeholder="Ej. Valentina, Mateo, etc."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-rose-300 font-medium text-stone-800"
                  />
                </div>
                <div>
                  <select
                    value={protagonistAge}
                    onChange={(e) => setProtagonistAge(parseInt(e.target.value))}
                    className="w-full text-xs px-2 py-2.5 rounded-xl border border-stone-200 bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-800 font-semibold"
                  >
                    {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((age) => (
                      <option key={age} value={age}>
                        {age} años
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chips rápidos de personajes */}
              <div className="flex flex-wrap gap-1 pt-1">
                {DEFAULT_CHARACTERS.map((char) => (
                  <button
                    key={char.name}
                    type="button"
                    onClick={() => {
                      setProtagonist(char.name);
                      setProtagonistAge(char.age);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                      protagonist === char.name
                        ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {char.name} ({char.age})
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Acompañante o Criatura Especial */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-600 block">
                  Acompañante Especial
                </label>
                <span className="text-[10px] text-stone-400 italic">
                  Escribe cualquier animal o ser
                </span>
              </div>
              <input
                type="text"
                value={companion}
                onChange={(e) => {
                  setCompanion(e.target.value);
                  setCompanionDetail('');
                }}
                placeholder="Ej. El Sapo Andrés, un zorrito, un búho sabio..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-800 font-medium"
              />
              <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-0.5">
                {DEFAULT_COMPANIONS.map((compPreset) => (
                  <button
                    key={compPreset.id}
                    type="button"
                    onClick={() => {
                      setCompanion(compPreset.name);
                      setCompanionDetail(compPreset.type);
                    }}
                    className={`text-left text-[11px] p-1.5 rounded-lg border transition-all ${
                      companion === compPreset.name 
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold' 
                        : 'bg-stone-50/60 border-stone-200/70 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className="truncate font-medium">{compPreset.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Lugar Mágico / Escenario */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-600 block">Lugar Mágico / Escenario</label>
                <span className="text-[10px] text-stone-400 italic">Personaliza o al azar</span>
              </div>
              <input
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Ej. Una cueva de amatistas con arroyos cantarines..."
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-800 font-medium"
              />
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {DEFAULT_ENVIRONMENTS.map((envPreset) => (
                  <button
                    key={envPreset.id}
                    type="button"
                    onClick={() => setEnvironment(envPreset.label)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                      environment === envPreset.label
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {envPreset.label.split(' ')[1] || envPreset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Objeto Secreto & Enseñanza Libre a Demanda */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Objeto Secreto</label>
                <input
                  type="text"
                  value={magicItem}
                  onChange={(e) => setMagicItem(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-800"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-600 block">Valor / Enseñanza (A demanda)</label>
                  <span className="text-[10px] text-stone-400 italic">Escribe el tuyo libremente</span>
                </div>
                <input
                  type="text"
                  value={moralValue}
                  onChange={(e) => setMoralValue(e.target.value)}
                  placeholder="Ej. Superar la timidez, cuidar a los abuelos, compartir con paciencia..."
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/70 focus:outline-none focus:ring-2 focus:ring-rose-300 text-stone-800 font-medium"
                />
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pt-0.5">
                  {DEFAULT_VALUES.map((valPreset) => (
                    <button
                      key={valPreset.id}
                      type="button"
                      onClick={() => setMoralValue(valPreset.label)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                        moralValue === valPreset.label
                          ? 'bg-rose-100 border-rose-300 text-rose-800 font-semibold'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {valPreset.id.charAt(0).toUpperCase() + valPreset.id.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Tono de la Narración */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-600 block">Tono del Cuento</label>
              <div className="grid grid-cols-3 gap-1.5">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStoryTone(t.id)}
                    className={`p-2 rounded-xl text-center text-xs border transition-all ${
                      storyTone === t.id
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <div className="text-sm mb-0.5">{t.icon}</div>
                    <div className="text-[10px] leading-tight line-clamp-1">{t.label.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Estructura: Párrafos y Líneas */}
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-amber-700" />
                  Estructura del Cuento
                </span>
                <span className="text-[10px] bg-amber-200/70 text-amber-900 font-semibold px-2 py-0.5 rounded-md">
                  {numParagraphs} Párrafos × ~{linesPerParagraph} Líneas
                </span>
              </div>

              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-600 mb-0.5">
                    <span>Número de párrafos:</span>
                    <span className="font-bold text-rose-700">{numParagraphs}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={numParagraphs}
                    onChange={(e) => setNumParagraphs(parseInt(e.target.value))}
                    className="w-full accent-rose-500 h-1.5 bg-amber-100 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-600 mb-0.5">
                    <span>Líneas por párrafo:</span>
                    <span className="font-bold text-rose-700">{linesPerParagraph} líneas</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="8"
                    value={linesPerParagraph}
                    onChange={(e) => setLinesPerParagraph(parseInt(e.target.value))}
                    className="w-full accent-rose-500 h-1.5 bg-amber-100 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 7. Tipografía y Estilo */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-rose-500" />
                  Tipografía Caligráfica
                </span>
                <span className="text-[10px] text-stone-400">Le Jardin Secret</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedFont('dancing')}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    selectedFont === 'dancing'
                      ? 'bg-white border-rose-400 text-rose-700 font-bold shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                  style={{ fontFamily: "'Dancing Script', cursive", fontSize: '14px' }}
                >
                  Dancing Script
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFont('caveat')}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    selectedFont === 'caveat'
                      ? 'bg-white border-rose-400 text-rose-700 font-bold shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                  style={{ fontFamily: "'Caveat', cursive", fontSize: '15px' }}
                >
                  Caveat Hand
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFont('marck')}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    selectedFont === 'marck'
                      ? 'bg-white border-rose-400 text-rose-700 font-bold shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                  style={{ fontFamily: "'Marck Script', cursive", fontSize: '13px' }}
                >
                  Marck Script
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFont('quicksand')}
                  className={`p-1.5 rounded-xl border text-center transition-all ${
                    selectedFont === 'quicksand'
                      ? 'bg-white border-rose-400 text-rose-700 font-bold shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-white'
                  }`}
                  style={{ fontFamily: "'Quicksand', sans-serif", fontSize: '12px' }}
                >
                  Lectura Clara
                </button>
              </div>

              <div className="pt-0.5">
                <label className="cursor-pointer block w-full text-center py-1.5 px-3 border border-dashed border-rose-300 rounded-xl bg-rose-50/40 hover:bg-rose-50 text-rose-700 text-xs font-medium transition-colors">
                  <div className="flex items-center justify-center gap-1.5">
                    <Upload className="w-3 h-3" />
                    <span>
                      {customFontLoaded ? '¡Fuente Le Jardin Secret cargada!' : 'Cargar fuente (.ttf, .otf)'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff"
                    onChange={handleFontUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] text-stone-500 whitespace-nowrap">Tamaño:</span>
                <input
                  type="range"
                  min="18"
                  max="32"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
                <span className="text-xs font-bold text-stone-700">{fontSize}px</span>
              </div>
            </div>

          </section>

          {/* Panel Derecho: Cuaderno de Cuentos */}
          <section className="lg:col-span-7 space-y-4">
            
            {/* Barra de pestañas y botones de acción */}
            <div className="flex items-center justify-between bg-white px-4 py-2 rounded-2xl border border-stone-200 shadow-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('story')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'story'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>El Cuento</span>
                </button>

                <button
                  onClick={() => setActiveTab('questions')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'questions'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Preguntas ({story.questions?.length || 3})</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Narración de Audio con Voz Limpia */}
                <button
                  onClick={handleReadAloud}
                  disabled={isAudioLoading}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isPlayingAudio
                      ? 'bg-amber-500 text-white animate-pulse shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                  title="Escuchar narración con voz cálida de cuento"
                >
                  {isAudioLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      <span>Cargando Voz...</span>
                    </>
                  ) : isPlayingAudio ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Detener Voz</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Escuchar Cuento</span>
                    </>
                  )}
                </button>

                {/* Regenerar Acuarela con Gemini 3.1 Flash Image */}
                <button
                  onClick={() => generateGeminiIllustration(story)}
                  disabled={isGeneratingImage}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Regenerar lámina de acuarela con Gemini Image"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-700 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                  <span>Regenerar Acuarela</span>
                </button>

                {/* Imprimir */}
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Imprimir cuento ilustrado en formato libro A4"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* Cuaderno / Pergamino de Lectura */}
            <div className="relative bg-[#fffdf9] border-2 border-[#e8ded0] rounded-3xl p-6 sm:p-10 shadow-lg shadow-stone-200/50 transition-all overflow-hidden">
              
              {/* Adornos en las esquinas */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-300/70 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-300/70 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-300/70 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-300/70 rounded-br-xl pointer-events-none" />

              <div className="flex items-center justify-center gap-2 mb-4 text-rose-300">
                <span className="text-base">❦</span>
                <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
                <span className="text-[11px] font-serif tracking-widest text-amber-700/70 uppercase font-semibold">
                  El Rincón de {story.protagonistUsed} ({story.protagonistAgeUsed} años)
                </span>
                <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
                <span className="text-base">❦</span>
              </div>

              {activeTab === 'story' && (
                <div className="space-y-6">
                  
                  <div className="text-center pb-2">
                    <h2 
                      className="text-3xl sm:text-4xl text-rose-950 font-bold leading-tight"
                      style={getFontStyle()}
                    >
                      {story.title}
                    </h2>
                    <p className="text-[10px] font-sans text-stone-400 mt-1 uppercase tracking-wider">
                      Lectura adaptada para {story.protagonistAgeUsed} años • Con {story.companionUsed}
                    </p>
                  </div>

                  {/* Lámina Ilustrada en Acuarela con Gemini 3.1 Flash Image */}
                  <div className="relative rounded-2xl overflow-hidden border border-amber-200/80 bg-amber-50/40 shadow-inner max-w-lg mx-auto aspect-[16/10] flex items-center justify-center group">
                    {imageUrl ? (
                      <>
                        <img 
                          src={imageUrl} 
                          alt="Ilustración acuarela del cuento" 
                          className={`w-full h-full object-cover transition-all duration-700 ${isGeneratingImage ? 'opacity-40 blur-xs scale-102' : 'opacity-100 scale-100'}`}
                        />
                        <div className="absolute top-2.5 right-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => generateGeminiIllustration(story)}
                            disabled={isGeneratingImage}
                            className="bg-white/90 hover:bg-white text-stone-700 text-[10px] font-bold px-2.5 py-1 rounded-xl shadow-md border border-stone-200 flex items-center gap-1 backdrop-blur-xs transition-all"
                            title="Generar nueva variación de la acuarela"
                          >
                            <RefreshCw className={`w-3 h-3 text-rose-500 ${isGeneratingImage ? 'animate-spin' : ''}`} />
                            <span>Variación</span>
                          </button>
                        </div>
                        <div className="absolute bottom-2 left-2.5 bg-stone-900/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-full font-sans font-medium">
                          {story.companionUsed} en {story.environmentUsed.split(' ')[1] || 'su paseo'}
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 text-stone-400 flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-amber-300" />
                        <p className="text-xs">Pintando la lámina con acuarelas...</p>
                      </div>
                    )}

                    {isGeneratingImage && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-rose-600 p-4 text-center">
                        <Sparkles className="w-8 h-8 animate-spin text-rose-500" />
                        <span className="text-xs font-bold text-stone-700">Pintando acuarela con Gemini Image...</span>
                        <span className="text-[10px] text-stone-500">Con {story.companionUsed} y {story.protagonistUsed}</span>
                      </div>
                    )}
                  </div>

                  {/* Barra de estado durante la narración */}
                  {isPlayingAudio && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />
                        <span className="font-semibold">{audioStatusText}</span>
                      </div>
                      <button 
                        onClick={stopAudio}
                        className="text-[10px] bg-rose-200 hover:bg-rose-300 text-rose-900 px-2.5 py-1 rounded-md font-bold transition-colors"
                      >
                        Pausar
                      </button>
                    </div>
                  )}

                  {/* Texto de los Párrafos con Resaltado al Leer */}
                  <div className="space-y-5 pt-2">
                    {story.paragraphs.map((paragraph, idx) => {
                      const isCurrent = currentNarratingParagraph === idx;
                      return (
                        <div 
                          key={idx} 
                          className={`relative p-2 rounded-xl transition-all duration-300 ${
                            isCurrent ? 'bg-rose-100/60 shadow-xs ring-1 ring-rose-200' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="text-xs text-rose-400/80 font-serif font-bold mt-1 select-none">
                              {idx + 1}.
                            </span>
                            <p 
                              className="text-stone-800 leading-relaxed tracking-wide text-justify font-normal"
                              style={{
                                ...getFontStyle(),
                                fontSize: `${fontSize}px`,
                                lineHeight: '1.75'
                              }}
                            >
                              {paragraph}
                            </p>
                          </div>

                          {idx < story.paragraphs.length - 1 && (
                            <div className="flex justify-center my-2.5 text-amber-200 text-xs select-none">
                              ✻ ✻ ✻
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Moraleja / Enseñanza */}
                  {story.moral && (
                    <div className={`mt-8 p-4 rounded-2xl transition-all duration-300 ${
                      currentNarratingParagraph === 99 ? 'bg-rose-100 ring-2 ring-rose-300' : 'bg-rose-50/70'
                    } border border-rose-100 text-center`}>
                      <p className="text-[11px] uppercase tracking-widest text-rose-600 font-bold font-sans mb-1">
                        El Secreto que nos Enseña
                      </p>
                      <p 
                        className="text-rose-900 italic"
                        style={{ ...getFontStyle(), fontSize: `${fontSize - 2}px` }}
                      >
                        "{story.moral}"
                      </p>
                    </div>
                  )}

                </div>
              )}

              {activeTab === 'questions' && (
                <div className="space-y-5 py-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold font-serif text-stone-800">
                      ¿Qué Recordamos del Paseo? 🌸
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Preguntas para conversar con {story.protagonistUsed} al terminar de leer
                    </p>
                  </div>

                  <div className="space-y-3.5 max-w-xl mx-auto">
                    {story.questions?.map((q, i) => (
                      <div 
                        key={i} 
                        className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-800 font-serif">
                            {q}
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Pista: Piensa en lo compartido junto a {story.companionUsed}.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-3">
                    <button
                      onClick={() => setActiveTab('story')}
                      className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all"
                    >
                      ← Volver a Leer el Cuento
                    </button>
                  </div>
                </div>
              )}

              {/* Pie de página del libro */}
              <div className="mt-8 pt-3 border-t border-amber-100 flex flex-wrap items-center justify-between text-[10px] text-stone-400">
                <span>Escrito con cariño para {story.protagonistUsed} • {story.protagonistAgeUsed} años</span>
                <span className="font-serif italic text-amber-800/60">Fin del Cuento</span>
              </div>

            </div>

            {/* Tarjeta didáctica */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Guía de Lectura ({story.protagonistAgeUsed} años):
              </span>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Tanto la narración como la ilustración se adaptan a tus elecciones. Al narrar el cuento, la voz lee pausada y claramente destacando cada párrafo sin ruidos molestos. Si indicas <strong>{story.companionUsed}</strong>, tanto la ilustración como los párrafos reflejarán su naturaleza biológica exacta.
              </p>
            </div>

          </section>

        </div>
      </main>

    </div>
  );
}