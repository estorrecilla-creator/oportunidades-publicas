# TEDDY'S NIGHTMARE
## Motor Oculto de Terror Adaptativo — Documento de Diseño de IA

*Diseño de sistema por: IA de Diseño de Videojuegos + Psicología del Terror Adaptativo*

---

## 0. Filosofía del sistema: la Variable Oculta de Cordura (VOC)

Antes de las reglas, el marco que las sostiene.

**VOC** es un flotante interno (0–100, empieza en 70) que el jugador **nunca ve**. No hay barra, no hay icono, no hay número. Solo se manifiesta como *cambios de mundo*. La VOC no baja por "recibir daño": baja por **incoherencia perceptiva sostenida** — la sensación acumulada de que el entorno no obedece a las reglas que el jugador cree haber aprendido.

Tres motores alimentan la VOC en tiempo real:

- **Motor de Telemetría de Comportamiento (MTC):** captura inputs crudos (touch, giro de cámara, velocidad, aceleración, pausas, repetición de rutas) en una ventana deslizante de 90 segundos.
- **Clasificador de Arquetipo (CA):** una red de reglas ligera (no ML pesado, pura heurística con pesos) que cada 10-15 segundos recalcula un vector de probabilidad sobre 4 arquetipos base: **Impulsivo, Prudente, Analítico, Errático**. El jugador puede moverse entre arquetipos; el juego no lo "etiqueta" para siempre, lo sigue.
- **Director de Amenaza (DA):** consume el vector del CA y decide *qué mentira contar* — geometría, sonido, o memoria — respetando una regla de oro: **nunca repetir el mismo tipo de mentira dos veces seguidas al mismo jugador**, porque la repetición es lo que permite al cerebro humano formar un patrón y neutralizar el miedo.

Con esa base, las tres Reglas Maestras:

---

## REGLA 1 — El Jugador Impulsivo

> *"El miedo del impulsivo no es a lo desconocido. Es a perder el control del ritmo que él mismo impuso."*

### 1.1 Detección a nivel de datos

El MTC marca a un jugador como candidato a "Impulsivo" cuando, en la ventana de 90s, se cumplen simultáneamente (no aisladamente — cualquiera de estos por sí solo es ruido):

| Señal | Umbral heurístico | Qué mide realmente |
|---|---|---|
| **Frecuencia de input táctil** | > 1 toque/seg sostenido (linterna, correr, interactuar) | Ansiedad motora, necesidad de agencia constante |
| **Varianza de heading de cámara** | Cambios de dirección > 45° cada < 1.2s | Escaneo nervioso, no exploración deliberada |
| **Velocidad de desplazamiento** | > 85% del tiempo en sprint/movimiento rápido | Evitación del entorno en lugar de lectura del entorno |
| **Tiempo de decisión en bifurcaciones** | < 0.8s antes de elegir camino | Ausencia de evaluación de riesgo consciente |
| **Ratio interacción/observación** | Interactúa con objetos sin detenerse a mirarlos primero | Prioriza acción sobre información |

Cuando 4 de 5 señales se activan en la misma ventana, el CA asigna **peso Impulsivo > 0.7** y el DA activa el "Protocolo de Fricción de Ritmo".

### 1.2 Contramedidas: romper el ritmo, no aumentar el peligro

El objetivo **no** es hacer el juego "más difícil" (más monstruos, más jumpscares) — eso confirma las expectativas del impulsivo y lo vuelve a poner en modo reactivo, que es donde se siente cómodo. El objetivo es **quitarle el metrónomo**.

**A. Mapa — Geometría "de goma"**
- Los pasillos que recorre a sprint se alargan procedimentalmente un 8-15% de forma invisible (el jugador nunca ve la costura del cambio, ocurre fuera de su FOV o durante un giro de cámara > 60°/seg, aprovechando el *change blindness* inducido por el propio movimiento rápido del jugador).
- Un atajo que usó en sprint 3 veces seguidas, a la cuarta vez **existe pero conduce a una habitación distinta** (misma textura de entrada, geometría interior alterada). No es un callejón sin salida — es un *desvío que no se anuncia*.
- Puertas que normalmente se abren al contacto instantáneo empiezan a tener un delay de 400-600ms aleatorio **solo para este jugador** — el tiempo suficiente para que su cerebro, acostumbrado a la respuesta inmediata, registre "algo no respondió cuando debía".

**B. Sonido — Ruptura de causalidad**
- Se introduce un sonido de "paso" o "crujido" **180-250ms ANTES** de que el jugador ejecute su propia acción (justo antes de que el juego procese su input de movimiento). Es indetectable conscientemente pero genera una sensación de "algo se anticipó a mí" — ataca directamente la ilusión de control que el impulsivo necesita.
- El audio ambiente se sincroniza sutilmente con la cadencia de sus pasos durante 20-30 segundos (el juego "aprende" su ritmo) y luego, en un solo latido, se desfasa 1/8 de tiempo. El jugador no sabe qué cambió, solo que "algo suena distinto ahora".

**C. Mentiras visuales — Aprovechar el motion blur y la periferia**
- Cuando la velocidad de giro de cámara supera el umbral, el motor inserta un objeto (una silueta, un juguete roto, una mancha) en el **10% exterior del FOV**, visible solo 2-3 frames — bajo el umbral de percepción consciente pero por encima del umbral de percepción periférica. El jugador "siente" que vio algo, nunca puede confirmarlo, y esto le impide volver a la misma velocidad de escaneo (ralentiza su propio giro de cámara para intentar "atraparlo").
- Duplicación fantasma: un objeto de la habitación (una silla, un oso roto) aparece por un instante en dos posiciones simultáneas durante una transición de sprint — solo capturable si el jugador se detiene a mirar. Es la trampa perfecta: **el impulsivo solo puede desactivar la amenaza dejando de ser impulsivo.**

**Resultado de diseño:** el impulsivo no es castigado con más monstruos. Es castigado con la **erosión de la fiabilidad de sus propios reflejos**, hasta que reducir la velocidad se convierte en la única estrategia que "funciona" — sin que el juego se lo diga nunca explícitamente.

---

## REGLA 2 — El Jugador Ultra-Prudente

> *"No hay que asustar al que se queda quieto en la luz. Hay que enseñarle que la luz nunca fue lo que él creía."*

### 2.1 Detección a nivel de datos

| Señal | Umbral heurístico | Qué mide realmente |
|---|---|---|
| **Tiempo de permanencia en zonas de alta luminancia** | > 70% del tiempo en tiles con valor de luz > 0.6 | Búsqueda activa de "zona segura" |
| **Revisitas a las mismas coordenadas** | Mismo tile (radio 2m) visitado ≥ 3 veces en 5 min | Necesidad de anclaje espacial, control por familiaridad |
| **Baja varianza de input** | Movimiento < 30% del tiempo, sin sprint jamás usado | Aversión al riesgo, hipervigilancia estática |
| **Micro-pausas antes de cada acción** | > 2s de "quietud de escaneo" antes de interactuar | Verificación compulsiva del entorno |
| **Patrón de retorno cíclico** | Vuelve a un punto de origen cada N minutos (patrón de "base") | Construcción mental de un refugio |

Cuando el CA detecta esto, activa el **"Protocolo de Erosión de Santuario"** — el más lento y quirúrgico de los tres, porque el prudente tiene la memoria más precisa del juego (por definición, mira más de lo que camina).

### 2.2 Contramedidas: destruir la confianza perceptiva, no la seguridad física

Nada de jumpscares en la zona segura — eso sería un error de diseño de libro, porque convertiría la zona en "peligrosa" de forma legible y el jugador simplemente elegiría otra. El objetivo es que **ninguna zona pueda volver a sentirse segura, incluyendo las nuevas que elija después**, sin que el juego le "quite" nada de forma detectable.

**A. La erosión de 1 grado (Regla del cambio imperceptible)**
Cada vez que el jugador regresa a su "zona segura" declarada (detectada por el patrón de retorno cíclico), el motor aplica **exactamente un cambio microscópico**, nunca más de uno por visita:
- Un objeto rotado 15-20° respecto a su posición original.
- La temperatura de color de la fuente de luz se desplaza 100-150K (casi imperceptible, pero acumulativo: a la 6ª-7ª visita la luz "ya no es la misma luz", aunque el jugador no pueda decir por qué).
- Una sombra proyectada en un ángulo que no corresponde a ninguna fuente de luz visible en la escena (offset de 5-8°, suficiente para generar disonancia subconsciente, no suficiente para ser "obviamente imposible" a primera vista).

El jugador prudente, que SÍ presta atención al detalle (es su estrategia de supervivencia), es exactamente el arquetipo que **va a notar algo está mal, pero nunca podrá probarlo**, porque cada cambio individual está diseñado para estar por debajo del umbral de certeza. Esto convierte su fortaleza (la observación) en la fuente de su terror.

**B. El Testigo Estático**
Una silueta humanoide u objeto (un segundo oso de peluche, más pequeño, con la cabeza girada) aparece **una única vez por partida**, en el fondo de la zona segura del jugador, completamente inmóvil, sin sonido, sin animación. Si el jugador lo mira directamente durante más de 1.5 segundos, desaparece en el siguiente parpadeo/giro de cámara (usando el mismo blink-frame trick de la Regla 1). No vuelve a aparecer jamás en esa partida. **No hay confirmación posible.** El juego nunca admite ni niega que estuvo ahí. Esto es deliberado: la ultra-prudencia se basa en la confianza en el propio registro visual; el Testigo destruye esa confianza de raíz, un solo evento no reproducible pesa psicológicamente más que 50 jumpscares reproducibles.

**C. El silencio que traiciona**
Cuando el jugador lleva más de 90 segundos inmóvil en su zona segura, el motor no añade sonido — **filtra** el ambiente existente: retira gradualmente las frecuencias medias (las que el oído asocia con "presencia viva" — respiración lejana, crujidos de madera con vida térmica) dejando solo graves y agudos. El resultado es un silencio que el cerebro interpreta como "demasiado perfecto para ser real", sin que haya ningún elemento nuevo que señalar. Es terror por sustracción, no por adición.

**Resultado de diseño:** el prudente no aprende que "moverse es peligroso, quedarse es seguro" (el error típico de terror mal diseñado, que enseña al jugador a explotar el camping). Aprende, sesión tras sesión, que **la seguridad es una ilusión con fecha de caducidad**, y que la única defensa real es no fijar nunca un punto de ancla — lo cual lo empuja, sin decírselo nunca, hacia el comportamiento exploratorio que el juego premia narrativamente.

---

## REGLA 3 — Persistencia entre Sesiones (El Mundo con Memoria)

> *"Teddy no olvida. Y peor: tampoco perdona con lógica humana — perdona con lógica de peluche roto."*

El motor guarda un **Registro de Cicatrices** (`scar_log`) por partida: no es un save de estado, es un log de *acciones significativas* (esconder, romper, bloquear, robar, mentir a un NPC, abandonar un objetivo). Cada entrada tiene: acción, ubicación, sesión, y un temporizador de "maduración" — el efecto no se aplica inmediatamente, se activa 1-3 sesiones después, para que el jugador nunca pueda conectar causa y efecto de forma consciente. Esto es clave: **la consecuencia jamás llega en la misma sesión que la causa.**

### Ejemplo 1 — Esconder un objeto (el oso gemelo)

**Sesión 1:** El jugador encuentra un segundo oso de peluche idéntico al suyo, dañado, en el sótano. Puede esconderlo dentro de un armario para "protegerlo" de una entidad que patrulla la zona (mecánica de sigilo estándar).

**Efecto latente:** el `scar_log` registra `hidden_object: oso_gemelo, location: armario_sotano, session:1`.

**Sesión 3 (impredecible):** el armario del sótano ya no existe en esa posición — el motor lo ha "movido" narrativamente a **otra planta de la casa**, y dentro no está el oso gemelo intacto: está **el oso gemelo con la cara del jugador cosida sobre la suya** (un asset generado proceduralmente sustituyendo la textura facial genérica por una foto de la cámara frontal del dispositivo, capturada de forma sutil durante el menú de pausa de la Sesión 1, si el jugador dio permiso de cámara — si no dio permiso, se usa una máscara en blanco con los mismos huecos donde irían los ojos, aún más inquietante por la ausencia). El juego nunca explica por qué "protegerlo" tuvo este resultado. La lección no es moral, es de horror puro: cuidar algo en este mundo no lo salva, lo *marca*.

### Ejemplo 2 — Romper algo (el espejo del pasillo)

**Sesión 1:** En un ataque de pánico (detectado por el MTC como pico de Impulsividad + baja VOC momentánea), el jugador rompe un espejo del pasillo principal para bloquear la visión de una entidad que lo perseguía por reflejo.

**Efecto latente:** `scar_log` registra `broken_object: espejo_pasillo, session:1, cause: panic_impulsive`.

**Sesión 3:** El espejo sigue roto (persistencia física esperable — esto el jugador lo anticipa). Lo impredecible: **todos los demás espejos de la casa han sido retirados de sus marcos por "alguien"**, dejando solo los marcos vacíos — excepto uno, en una habitación que el jugador nunca visitó en las sesiones 1 y 2, donde el espejo roto original **ha sido reensamblado con los fragmentos exactos**, pero el reflejo que muestra tiene un delay de 300ms respecto al movimiento real del jugador. El motor convierte un acto de escape en la Sesión 1 en una prueba de que la entidad **coleccionó los pedazos** — sin ningún diálogo ni cinemática que lo confirme, solo geometría y timing.

### Ejemplo 3 — Bloquear un camino (la puerta del jardín trasero)

**Sesión 1:** El jugador atranca la puerta del jardín trasero con un mueble para impedir el paso de una amenaza, una decisión típica de "barricada" en terror.

**Efecto latente:** `scar_log` registra `blocked_path: puerta_jardin, session:1, method: barricade`.

**Sesión 3:** La puerta sigue bloqueada — pero el motor ha **redirigido la topología del mapa completo**: la ruta que antes cruzaba el jardín ahora es la única forma de llegar al objetivo final de esa sesión, y el juego, en lugar de simplemente "desbloquearla" (rompiendo la inmersión), hace que **el mueble con el que la atrancó haya sido arrastrado hacia adentro de la casa, con marcas de arrastre en el suelo que el jugador puede seguir en sentido inverso** — llevándolo de vuelta al punto exacto donde tomó la decisión en la Sesión 1, ahora completamente transformado (más oscuro, con el mobiliario reorganizado), obligándolo a re-caminar su propia decisión pasada como si el juego dijera: *"Tu barricada no te protegió. Solo eligió, por ti, hacia dónde ibas a tener que volver."*

**Principio de diseño detrás de las tres:** ninguna consecuencia castiga la acción en sí (esconder, romper, bloquear son todas decisiones razonables de supervivencia). Lo que aterra es que **la consecuencia llega desfasada, deformada y sin atribución causal explícita** — el jugador siente que el mundo recuerda, pero nunca puede probar exactamente qué recordó ni por qué eligió manifestarlo así. Eso es lo que separa "el juego tiene memoria" (mecánico) de "el juego tiene rencor" (psicológico).

---

## HISTORIA JUGABLE COMPLETA — "La Casa que Teddy Construyó"

### Premisa
El jugador despierta como un oso de peluche animado — **Teddy** — en la habitación de una niña, Mara, de 7 años, que ha desaparecido. La única pista es su propia voz infantil, grabada en una casetera de juguete, repitiendo: *"Teddy, si me pierdes, construye la casa otra vez. Yo estaré donde tú la dejes."* El mapa abierto gótico-infantil es, en realidad, **una reconstrucción mental de Mara hecha de los recuerdos de Teddy** — y cada decisión del jugador no solo altera el mundo del juego, sino que **reescribe la memoria que la casa representa**.

### Acto I — La Habitación (Sesión 1, tutorial encubierto)
El jugador aprende los controles básicos (manos de peluche, linterna de cuerda que hay que rebobinar manualmente — mecánica que naturalmente frena a los Impulsivos y da falsa seguridad a los Prudentes) mientras explora la habitación de Mara y el pasillo adyacente. Aquí el CA recoge los primeros 90 segundos de datos limpios sin que el jugador lo sepa: esta sesión existe, narrativamente, para que el juego **decida quién es el jugador** antes de que la casa "reaccione" en serio. Al final del acto, el jugador toma su primera decisión persistente (esconder/romper/bloquear, ver Regla 3) al huir de la primera manifestación: **la Niñera de Trapo**, una entidad cosida con retazos que nunca corre, solo camina a velocidad constante — un diseño deliberado para que la sensación de peligro no dependa de velocidad sino de inevitabilidad.

### Acto II — El Sótano y el Jardín (Sesiones 2-4, Reglas 1 y 2 en pleno efecto)
La casa se abre a un sótano (asociado a la Regla 1: pasillos elásticos, atajos falsos — zona diseñada para jugadores que huyen) y a un jardín trasero gótico con farolas (asociado a la Regla 2: zonas de luz que el juego erosiona con el tiempo). El jugador, sin saberlo, entrena al Director de Amenaza sobre su propio arquetipo. La Niñera de Trapo empieza a aparecer con detalles ligeramente distintos cada vez — nunca lo bastante para confirmar un patrón, lo suficiente para sembrar la duda. En este acto se planta la semilla narrativa: Teddy encuentra fragmentos de un diario de Mara que sugiere que **ella construyó esta casa-recuerdo para esconder algo de sí misma**, no solo de la Niñera.

### Acto III — El Ático de las Cicatrices (Sesión 5+, Regla 3 en pleno efecto)
Aquí convergen las consecuencias maduradas del `scar_log`. El ático es literalmente un espacio que se genera a partir de las decisiones acumuladas del jugador en sesiones anteriores: si escondió el oso gemelo, lo encuentra aquí, transformado; si rompió el espejo, el ático tiene el espejo reensamblado; si bloqueó el jardín, las marcas de arrastre terminan en esta habitación. El ático revela el giro central: **la Niñera de Trapo no es una entidad separada — es la proyección de cada decisión "seguridad ante todo" que el jugador tomó**, cosida con los objetos que él mismo escondió, rompió o bloqueó. Cuanto más "prudente" o "controlador" jugó el usuario, más completa y humana luce la Niñera; cuanto más "impulsivo", más deforme e incompleta — un espejo psicológico literal del comportamiento del jugador a través de las sesiones.

### Final (múltiple, determinado por la VOC acumulada, no por un choice explícito)
- **VOC alta (jugador mantuvo cordura, exploró con equilibrio entre cautela y avance):** Teddy encuentra a Mara escondida — no perdida, sino *escondiéndose de sí misma* — y la casa colapsa suavemente en luz mientras la casetera repite: *"Gracias por no dejar de buscar."*
- **VOC baja (jugador impulsivo/prudente extremo, erosionado por las Reglas 1-2 sin adaptarse):** Teddy encuentra la habitación vacía de Mara, y su propia voz de peluche, al hablar, sale con **la voz grabada del jugador capturada por el micrófono en momentos de tensión durante la partida** (si dio permiso; si no, un silencio antinatural donde debería estar su voz) — sugiriendo que Teddy se ha convertido en la Niñera para el siguiente jugador.

El bucle se cierra: la partida del jugador, con todas sus cicatrices, queda en el `scar_log` como semilla para **una futura partida de otro perfil** (opcional, asíncrono, tipo "fantasmas" de otros jugadores) — la casa nunca se resetea del todo, solo cambia de quién la está soñando.

---

### Resumen de arquitectura del sistema

```
MTC (telemetría 90s) → CA (vector de arquetipo, peso 0-1 por tipo)
                              ↓
                    DA (elige mentira: geometría / sonido / memoria)
                              ↓
                    VOC (se ajusta según coherencia percibida)
                              ↓
              scar_log (persiste decisiones, madura 1-3 sesiones)
                              ↓
                    Reescritura de mundo en sesión N+1..N+3
```

La regla no escrita que ata todo el sistema: **el juego nunca miente dos veces igual, y nunca confirma una mentira.** Esa ambigüedad perpetua es la verdadera "dificultad" oculta — no hay barra de vida que gestionar, solo la pregunta que el jugador se hace en silencio: *¿esto siempre fue así?*
