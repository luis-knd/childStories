# El Jardín Secreto

Aplicación móvil de cuentos infantiles personalizables construida con Expo,
React Native y TypeScript. Con conexión genera cuentos e ilustraciones mediante
Cloudflare Workers AI; sin conexión recurre a una gramática Tracery incluida en
el APK. Ambos caminos funcionan sin activar servicios de pago.

## Funcionalidades de la primera versión

- Protagonista y edad entre 3 y 15 años.
- Hasta cuatro acompañantes de catálogo o personalizados en un mismo cuento.
- Objeto secreto, enseñanza, tono y extensión configurables.
- Acompañante, lugar mágico y enseñanza libres para inventar cada detalle.
- Generación dinámica con continuidad narrativa, objeto funcional y lenguaje adaptado por edad.
- Respaldo local reproducible basado en una gramática española con Tracery.
- Fuente `escolar1.ttf` como opción principal y cuatro alternativas incluidas.
- Narración con la voz disponible en Android mediante `expo-speech`.
- Láminas generadas para cada cuento mediante FLUX.1 Schnell en Workers AI.
- Respaldo automático con ilustraciones CC0/dominio público de Openverse y una lámina local adaptable.
- Atribución de título, autor, licencia y fuente de cada imagen externa.
- Preferencias guardadas localmente en el dispositivo.

## Ejecutar en desarrollo

Requisitos: Node.js 22.13 o posterior y la aplicación Expo Go o un emulador
Android.

```bash
npm install
npm start
```

Escanea el QR con Expo Go. También puedes iniciar Android desde la terminal con
la tecla `a` si tienes un emulador configurado.

## Configurar la generación dinámica gratuita

La aplicación utiliza un Worker familiar que genera tanto el texto como la
lámina. La cuenta debe permanecer en **Workers Free**. No enlaces un método de
pago ni actives Workers Paid: al terminar la cuota diaria, la app usará el
generador local y no producirá cargos.

Inicia sesión en una cuenta gratuita de Cloudflare:

```bash
npx wrangler login
```

Comprueba que el Worker compila y crea una credencial familiar aleatoria:

```bash
npm run worker:check
openssl rand -hex 32
```

Guarda esa credencial como secreto del Worker. Wrangler pedirá el valor sin
mostrarlo en la terminal:

```bash
npx wrangler secret put FAMILY_ACCESS_TOKEN --config worker/wrangler.jsonc
```

Despliega el Worker. En el primer despliegue, Wrangler aprovisiona el espacio KV
gratuito usado para los límites por instalación:

```bash
npm run worker:deploy
```

Copia la URL `workers.dev` mostrada por Wrangler y crea la configuración del APK:

```bash
cp .env.example .env
```

```dotenv
EXPO_PUBLIC_STORY_API_URL=https://el-jardin-secreto-family.tu-subdominio.workers.dev
EXPO_PUBLIC_FAMILY_ACCESS_TOKEN=el_mismo_token_configurado_en_el_worker
```

La credencial familiar se incluye en el APK y solo protege el acceso casual al
Worker; no concede acceso administrativo a Cloudflare. Para revocarla, cambia
el secreto del Worker, actualiza `.env` y genera un APK nuevo. Las credenciales
de cuenta de Cloudflare nunca deben copiarse al proyecto.

Si el Worker no está configurado, no hay red, se alcanza el límite familiar o
se agota la cuota gratuita de Workers AI, la aplicación continúa funcionando con
el cuento predefinido de Tracery. Las láminas prueban FLUX, luego Openverse con
una consulta genérica en inglés y finalmente la composición local.

## Generar un APK instalable

La compilación principal es totalmente local y no requiere Android Studio,
Android SDK, Java, Node.js, una cuenta de Expo ni EAS. El único requisito en el
equipo es Docker con Docker Compose.

```bash
npm run build:apk
```

La primera ejecución descarga la imagen y las dependencias Android, por lo que
puede tardar varios minutos y ocupar algunos gigabytes. Las siguientes
compilaciones reutilizan cachés locales de Docker.

Los archivos resultantes quedan en `artifacts/`:

- `el-jardin-secreto.apk`: instalador Android firmado.
- `el-jardin-secreto.apk.sha256`: checksum para comprobar la descarga o copia.
- `el-jardin-secreto-cert.pem`: certificado público para el registro Android.
- `certificate-sha256.txt`: huella pública de la clave de firma.

La clave privada se crea una sola vez en
`.android-signing/el-jardin-secreto.keystore`. Esta carpeta no se incluye en Git:
haz una copia de seguridad privada porque perderla impediría actualizar una
instalación existente. No compartas ni subas el archivo `.keystore`.

Para revisar la secuencia sin compilar:

```bash
npm run build:apk:dry-run
```

El perfil EAS se mantiene únicamente como alternativa opcional mediante
`npm run build:apk:cloud`; sí requiere una cuenta de Expo y utiliza su servicio
remoto.

## Instalar y verificar para uso personal

Transfiere `artifacts/el-jardin-secreto.apk` al dispositivo, ábrelo y autoriza
temporalmente la instalación de aplicaciones desde esa aplicación de archivos o
navegador. Android puede mostrar una advertencia porque el APK no procede de
Google Play.

Para el programa de verificación de desarrolladores de Android, el proyecto ya
genera el nombre de paquete y los datos públicos de firma necesarios. La ruta
recomendada es la cuenta gratuita de distribución limitada, pensada para uso
personal y hasta 20 dispositivos autorizados.

## Verificación

```bash
npm test
npm run typecheck
npm run worker:check
npx expo-doctor@latest
npm run export
```

## Estructura

```text
src/
├── domain/story/          # Reglas, catálogo y generación local
├── features/configurator/ # Pantalla de personalización
├── features/reader/       # Lectura, preguntas, voz e ilustración
├── services/              # Openverse y almacenamiento local
└── ui/                    # Tema y componentes compartidos
worker/
├── src/                   # API familiar, prompts, límites y modelos
└── wrangler.jsonc         # Worker, Workers AI y KV gratuitos
```

El fichero web original `magicChildStories.tsx` se conserva únicamente como
referencia visual y funcional; no forma parte del bundle móvil.

## Imágenes y licencias

El Worker recibe las pautas necesarias para redactar el cuento. El prompt visual
sustituye los nombres personales por roles antes de solicitar la lámina. La
búsqueda de respaldo no recibe nombres familiares y solicita a Openverse
únicamente resultados marcados como CC0 o dominio público. Openverse agrega
metadatos de proveedores externos, por lo que conviene abrir la atribución
incluida en cada cuento antes de reutilizar una imagen fuera de la aplicación.
Esta aplicación utiliza la API de Openverse, pero no está avalada ni certificada
por Openverse.

## Licencia

Este proyecto es software propietario y conserva todos los derechos. Copiar,
modificar, redistribuir, crear obras derivadas o hacer fork requiere autorización
previa y expresa del titular. Consulta [LICENSE](LICENSE) para conocer los
términos completos. Si el repositorio se publica en GitHub, las funciones de la
plataforma quedan además sujetas a los términos obligatorios de GitHub.

Documento revisado: 15 de septiembre de 2026.
