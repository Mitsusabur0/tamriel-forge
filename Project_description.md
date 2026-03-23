**1\. Problema o Necesidad que Resuelve la Aplicación** 

**Contexto: Los videojuegos de rol y la narrativa del jugador** 

Los videojuegos de rol (RPG, por sus siglas en inglés) son un género en el que el jugador asume la identidad de un personaje ficticio dentro de un mundo imaginario. A diferencia de otras categorías de videojuegos, los RPG invitan activamente al jugador a construir una identidad: elegir una raza, una clase, un origen y una personalidad. Este género es uno de los más populares a nivel mundial, con franquicias que acumulan decenas de millones de jugadores. 

Dentro de esta cultura, existe una práctica conocida como roleplay, que consiste en que el jugador no solo juega mecánicamente, sino que experimenta el mundo desde la perspectiva de su personaje: toma decisiones coherentes con su historia, su moral y su trasfondo. Esta práctica enriquece enormemente la experiencia, y tiene comunidades activas en foros, redes sociales y servidores dedicados. 

**The Elder Scrolls y su universo de lore** 

The Elder Scrolls es una de las franquicias de RPG más icónicas de la historia, con títulos como Morrowind, Oblivion, Skyrim y Elder Scrolls Online. Su universo (conocido como Tamriel) es extraordinariamente rico: incluye múltiples razas con culturas propias, naciones con historia política detallada, religiones complejas, facciones en conflicto y miles de años de cronología documentada. Esta profundidad hace que una parte significativa de su comunidad, además de jugar sus títulos, estudie y disfrute su lore (mitología y trasfondo narrativo) de forma independiente. 

**El problema concreto** 

Muchos jugadores de Elder Scrolls, al comenzar una nueva partida, invierten tiempo considerable en crear un personaje con una historia coherente con el universo del juego. Este proceso creativo típicamente implica: definir el trasfondo narrativo del personaje (origen, motivaciones, eventos formativos), transformar ese trasfondo en un texto literario de buena calidad, generar un retrato visual del personaje y, en algunos casos, producir una narración en audio de esa historia para una experiencia más inmersiva. 

Si se utilizan herramientas de IA como asistentes, este proceso está completamente fragmentado. El jugador debe recurrir a wikis especializadas para verificar coherencia con el lore, a herramientas de escritura para redactar el texto, a plataformas de generación de imágenes para el retrato y a servicios de text-to-speech para el audio. No existe ninguna herramienta que unifique este flujo, y ninguna de las existentes tiene conocimiento profundo del universo de Elder Scrolls.

**La solución propuesta: TamrielForge** 

TamrielForge es una aplicación web que consolida todo este proceso creativo en un único lugar, potenciado por inteligencia artificial generativa y fundamentado en el lore oficial de la franquicia. El objetivo central es permitir que cualquier jugador —independientemente de su habilidad para escribir o dibujar— pueda crear un personaje rico, coherente con el universo de Elder Scrolls, y obtener como resultado una historia escrita, un retrato visual y una narración en audio. 

**Funcionamiento y arquitectura de la aplicación**

TamrielForge se estructura como un pipeline de cuatro etapas secuenciales, cada una respaldada por un componente de inteligencia artificial generativa distinto.

La primera etapa corresponde al módulo conversacional, donde un modelo de lenguaje interactúa con el usuario para recopilar los atributos del personaje. Este módulo opera en conjunto con un sistema RAG (Retrieval-Augmented Generation) como tool, construido a partir del contenido de la wiki UESP, la fuente más completa de lore oficial de Elder Scrolls. Ante cada input del usuario, el sistema tiene la capacidad de llamar al sistema RAG cuando sea beneficioso. Con esta llamada trae los fragmentos relevantes de la base de conocimiento y los inyecta en el contexto del modelo, garantizando que las respuestas y sugerencias sean coherentes con el canon de la franquicia.

La segunda etapa es la generación del trasfondo narrativo. Una vez completado el perfil del personaje, toda la información recopilada se consolida en un prompt estructurado que se envía a un modelo de lenguaje de alta capacidad. Este modelo produce un texto literario en prosa que funciona como la historia de origen del personaje, con coherencia interna y estilo acorde al universo de fantasía de la franquicia.

La tercera etapa es la generación de imagen. La descripción física y contextual del personaje se traduce en un prompt para un modelo de generación de imágenes, que produce uno o más retratos en estilo de ilustración de fantasía épica.

La cuarta etapa, de carácter opcional, es la síntesis de audio. El texto generado en la segunda etapa se envía a un modelo TTS (text-to-speech) que produce un archivo de audio narrado. Esta etapa se activa únicamente si el usuario la solicita, lo que la excluye del costo base por cada creación de personaje.

**2\. Justificación de la Selección de Modelos** 

Para la selección de modelos se utilizó como referencia principal el benchmark de Arena.ai (https://arena.ai/leaderboard/), específicamente el ranking de escritura creativa. Se priorizó este benchmark por sobre evaluaciones tradicionales, ya que sus resultados emergen de comparaciones directas realizadas por miles de usuarios reales en condiciones prácticas, lo que lo hace más representativo del rendimiento percibido en uso real. 

Un criterio transversal en la selección fue la coherencia de suite: los cuatro modelos elegidos pertenecen al ecosistema de Google Gemini. Esto no es una decisión menor. Utilizar un único  
proveedor simplifica significativamente la integración técnica (una sola API, una sola clave, una sola consola de facturación), reduce la complejidad operacional del sistema y facilita el monitoreo de costos. En una aplicación con múltiples componentes de IA, esta coherencia representa una ventaja arquitectónica concreta. 

**Rol 1 — Asistente Conversacional: gemini-3-flash** 

Este modelo opera durante la fase de construcción del personaje, donde mantiene un diálogo iterativo con el usuario y consulta el sistema RAG de lore cuando es necesario. Al ser la etapa más frecuente en términos de llamadas a la API —cada mensaje del usuario genera una nueva consulta— el costo por token es el factor crítico. Gemini-3-flash es el modelo más económico dentro del top 10 en el ranking de Arena.ai para escritura creativa. Esta combinación de costo reducido y calidad suficiente lo convierte en la opción óptima para un rol de alta frecuencia donde la profundidad literaria no es el objetivo principal, sino la fluidez conversacional y la coherencia con el lore. 

**Rol 2 — Escritor de Trasfondo: gemini-3.1-pro-preview** 

Este modelo se activa una única vez por personaje, con la tarea de producir el texto literario final. Al ser el producto central de la aplicación —aquello por lo que el usuario realmente viene— la calidad no es negociable. gemini-3.1-pro-preview ocupa el segundo lugar en el ranking de escritura creativa de Arena.ai. Se prefirió sobre el modelo en primer lugar por una razón de eficiencia económica: ofrece una calidad prácticamente equivalente a un costo inferior. Al ejecutarse solo una vez por flujo completo de usuario, el mayor costo unitario es absolutamente justificable. La pertenencia a la misma suite que el modelo conversacional garantiza además coherencia estilística en los outputs. 

**Rol 3 — Generador de Retratos: gemini-2.5-flash-image-preview** 

La generación de imágenes cumple un rol complementario: enriquecer visualmente la experiencia del usuario con un retrato de su personaje. Para este rol, la calidad absoluta es menos crítica que para la escritura, dado que el producto principal de la aplicación es narrativo. gemini-2.5-flash-image-preview ofrece una calidad suficiente para producir retratos de fantasía convincentes, a menor costo que los modelos de imagen de última generación. Mantener la suite unificada de Gemini evita además la complejidad de integrar proveedores externos especializados en imagen. 

**Rol 4 — Narrador de Audio (opcional): gemini-2.5-flash-preview-tts** 

La narración en audio es una funcionalidad opcional, pensada para usuarios que desean una experiencia más inmersiva. Por su carácter optativo, no todos los usuarios la activarán, lo que reduce su impacto en el costo total del sistema. gemini-2.5-flash-preview-tts ofrece síntesis de voz de buena calidad a un precio competitivo, adecuado para producir narraciones con el tono 

dramático que evoca la franquicia. Al igual que los modelos anteriores, su integración dentro del ecosistema Gemini simplifica el desarrollo y el mantenimiento de la aplicación.

En síntesis, la estrategia de selección de modelos sigue un principio claro: máxima calidad donde el usuario lo percibe directamente (escritura del trasfondo), costo optimizado donde la frecuencia de uso lo exige (conversación), y suficiencia funcional donde el rol es complementario (imagen y audio). Todo ello dentro de un ecosistema unificado que reduce la fricción técnica y operacional del sistema.  
