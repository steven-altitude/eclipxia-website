---
title: "La gira de Morat, escrita y encendida por sus fans"
seoTitle: "Morat: plataforma en vivo para conciertos"
client: "Morat"
sector: "Música en vivo"
summary: "Una plataforma para la gira Ya Es Mañana: los fans dejan su recuerdo desde un QR y, con la Experiencia de Colores, convierten su celular en parte del show, sincronizados por producción."
order: 1
services: ["Plataformas a medida", "Tiempo real", "Experiencias en vivo"]
metrics:
  - value: "52.404"
    label: "recuerdos enviados por fans en la gira"
  - value: "39.304"
    label: "fans únicos registrados"
  - value: "11.277"
    label: "elecciones de color en los primeros tres shows"
  - value: "2.654/s"
    label: "envíos por segundo soportados en pruebas de carga"
aiBuild: "Toda la plataforma se construyó con agentes de IA de ingeniería que también ejecutaron las migraciones, los despliegues y las pruebas de carga. La primera versión estuvo en producción al día siguiente de cotizada, y la Experiencia de Colores quedó funcionando el mismo día del pedido, una semana antes de la fecha comprometida."
aiUse: "En la experiencia del fan no hay IA a la vista, y es una decisión: en un estadio lo que importa es que cargue al instante y no falle. Donde Morat sí la siente es en la velocidad de respuesta: preguntas nuevas por ciudad, canciones y efectos para cada fecha se ajustan en horas, porque el mismo equipo de agentes que construyó la plataforma la mantiene durante la gira."
image: "/casos/morat-recuerdos-y-colores/colores.jpg"
imageAlt: "Celulares del público encendidos en verde, blanco y rojo con la Experiencia de Colores"
---

## La problemática y el objetivo

Morat salió de gira con el **YEM World Tour, Ya Es Mañana 2026-2027**, y quería que cada show tuviera un momento propio de sus fans. La banda ya había hecho una dinámica parecida en una gira anterior y conocía el riesgo: en un concierto, miles de personas envían al mismo tiempo, desde el mismo WiFi del recinto y con la señal saturada. El requisito fue claro: soportar miles de envíos simultáneos sin colapsar.

Después llegó un segundo pedido. En los shows grandes, el público se ilumina con manillas LED de colores, pero su costo no se justifica en fechas más pequeñas. La pregunta fue si se podía lograr el mismo efecto solo con los celulares del público: escanear un QR, elegir una canción y que la pantalla se vuelva de ese color.

## El planteamiento de Eclipxia

Diseñamos para el peor minuto del concierto, no para el promedio. El fan solo escribe y la página se sirve desde la red de distribución, así el tiempo real queda reservado para el equipo de producción. Antes de la primera fecha sometimos la plataforma a **10.000 envíos simultáneos sin errores**, y lo que esa prueba destapó se corrigió: por ejemplo, el límite por conexión bloqueaba a muchos fans que compartían el WiFi del recinto, y se cambió por un control por celular.

Para los colores aplicamos la misma lógica: el color se resuelve en el teléfono de cada fan y no en un servidor. Así el sistema aguanta un estadio lleno sin importar cuántas personas estén conectadas.

## La solución

**Recuerdos en vivo.** El fan escanea el QR, deja su nombre y un recuerdo de 120 caracteres, y ve una animación con la línea gráfica de la gira. Producción modera los mensajes en un panel pensado para trabajar en pleno show: búsqueda instantánea sobre toda la base, copiado en un clic, limpieza de pantalla entre fechas y una pregunta distinta para cada ciudad. El equipo de visuales consume los textos directamente para las pantallas del escenario.

<figure>
  <img src="/casos/morat-recuerdos-y-colores/fan.jpg" alt="Formulario del fan para dejar su recuerdo y menú de canciones de la Experiencia de Colores" loading="lazy" width="1600" height="1000" />
  <figcaption>Lo que ve el fan: su recuerdo para la pantalla del show y la elección de canción. Fecha activa: México.</figcaption>
</figure>

**Experiencia de Colores.** El fan elige una de tres canciones y toda su pantalla toma ese color: amarillo, azul o rojo. La pantalla no se apaga y la página invita a subir el brillo. Desde la consola, producción toma el control en modo director:

- **Color sincronizado:** fuerza un color en todos los celulares al mismo tiempo, con una precisión de décimas de segundo, gracias a que cada teléfono sincroniza su reloj con el servidor.
- **Efectos en fase:** fijo, pulso o destello, con todos los teléfonos latiendo juntos.
- **Mensajes gigantes:** el nombre de la ciudad sobre el color, a pantalla completa.
- **Conteo en vivo:** qué canción va ganando, minuto a minuto.


<figure>
  <img src="/casos/morat-recuerdos-y-colores/colores.jpg" alt="Tres celulares en verde, blanco y rojo, los colores de cada canción" loading="lazy" width="1600" height="1000" />
  <figcaption>Cada canción, un color. En la fecha de México, los colores de la bandera.</figcaption>
</figure>

El resultado es un estadio que se enciende a la vez, sin hardware adicional. En sus primeros tres shows, el público hizo más de 11.000 elecciones de color.
