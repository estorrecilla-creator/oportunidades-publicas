# Yapp (MVP)

App móvil (Expo / React Native) para chatear y conocer gente nueva. No es una
app de citas: al abrir la app entras directo a una **sala general común para
todo el mundo**, y además puedes crear/explorar **salas públicas por tema**
(estilo IRC), tener **chats 1 a 1** y **grupos privados** (estilo WhatsApp).

## 1. Crear el proyecto de Firebase (gratis)

1. Entra en https://console.firebase.google.com y pulsa **"Agregar proyecto"**.
2. Ponle un nombre (por ejemplo, el nombre de tu app) y crea el proyecto (puedes
   desactivar Google Analytics, no hace falta).
3. Dentro del proyecto, ve a **Compilación > Authentication > Comenzar** y
   activa el proveedor **Correo electrónico/contraseña**.
4. Ve a **Compilación > Firestore Database > Crear base de datos**. Elige
   **modo de producción** y la región más cercana.
5. Ve a **Compilación > Storage > Comenzar** para activar el almacenamiento
   de fotos (también en modo de producción).
6. Ve a **Configuración del proyecto** (icono de engranaje) > pestaña
   **General** > sección "Tus apps" > pulsa el icono **Web (`</>`)** para
   registrar una app web (aunque uses Expo, el SDK de Firebase para React
   Native usa la configuración "web"). No hace falta Firebase Hosting.
7. Copia el objeto `firebaseConfig` que te muestra: ahí están las claves que
   necesitas.

## 2. Configurar las claves en el proyecto

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Y rellena cada valor con los datos de `firebaseConfig` del paso anterior:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

Estas claves de Firebase para apps cliente no son secretas (están pensadas
para ir embebidas en la app), pero la seguridad real la dan las reglas de
Firestore/Storage del siguiente paso.

## 3. Publicar las reglas de seguridad

En la consola de Firebase:

- Ve a **Firestore Database > Reglas**, borra lo que haya y pega el
  contenido de `firestore.rules` (en la raíz de este proyecto). Pulsa
  **Publicar**.
- Ve a **Storage > Reglas**, borra lo que haya y pega el contenido de
  `storage.rules`. Pulsa **Publicar**.

Estas reglas garantizan que:
- Cualquier usuario registrado puede ver perfiles ajenos, pero solo puede
  editar el suyo.
- Solo los participantes de un chat (1 a 1 o grupo) pueden leer y escribir
  sus mensajes; en un grupo, solo su creador puede añadir o quitar miembros.
- Cualquier usuario registrado puede ver y escribir en las salas públicas
  (incluida la sala general), y cualquiera puede crear una sala nueva.
- Solo puedes subir tu propia foto de perfil (máx. 5MB, solo imágenes).

## 4. Instalar dependencias y arrancar la app

```bash
npm install
npx expo start
```

Se abrirá una pantalla con un código QR. Instala la app **Expo Go** en tu
móvil (Android o iOS) desde la tienda correspondiente, y escanea el QR con
la cámara (iOS) o desde la propia app Expo Go (Android). La app se abrirá
en tu móvil sin necesidad de publicarla en ninguna tienda.

## 5. Cómo funciona la app

- **Registro/login**: email + contraseña (Firebase Authentication).
- **Crear perfil**: nombre, foto (se sube a Firebase Storage) y descripción
  (se guarda en Firestore, colección `users`).
- **Pantalla de inicio (pestaña "General")**: sala de chat pública común para
  todo el mundo, se crea sola la primera vez que alguien entra
  (colección `rooms`, documento `general`).
- **Explorar**: lista/cuadrícula con los perfiles de los demás usuarios.
- **Salas**: cualquiera puede crear una sala pública por tema (ej.
  `#videojuegos`); cualquier usuario puede verla y escribir en ella
  (colección `rooms`, cada una con su subcolección `messages`).
- **Chats**: conversaciones 1 a 1 (al pulsar "Enviar mensaje" en un perfil) y
  grupos privados sin límite de miembros (botón "+ Nuevo grupo", solo puedes
  añadir a gente con la que ya tengas un chat abierto). El creador del grupo
  puede eliminar miembros desde "Miembros" dentro del chat. Todo en tiempo
  real (colección `chats` y subcolección `messages`).

## 6. Cuando quieras distribuir la app de verdad

Mientras validáis la idea, compartir el enlace/QR de Expo Go es gratis y
suficiente. Cuando quieras que la gente se la instale sin depender de Expo
Go, puedes generar un APK de Android gratis con
[EAS Build](https://docs.expo.dev/build/introduction/) (`npx eas build -p
android --profile preview`) y compartirlo por link, sin pagar nada a Google
todavía. Publicarla oficialmente en Google Play cuesta un pago único de 25$,
y en la App Store de Apple una cuota de 99$/año — solo serían necesarios
cuando decidáis lanzarla de forma oficial.

## Estructura del proyecto

```
src/
  config/       Configuración de Firebase y tema visual (colores, radios...)
  context/      AuthContext: estado de sesión y perfil del usuario
  navigation/   Navegación (auth stack, tabs principales, stack de detalle)
  screens/      Login, Register, EditProfile, Explore, ProfileDetail,
                Room, RoomsList, CreateRoom, ChatsList, Chat, CreateGroup,
                GroupMembers
  utils/        Utilidades (generación de ids de chat 1 a 1)
```
