---
title: "De varias hojas de cálculo a una comunidad de 3.000 exalumnos"
seoTitle: "The Alumni Sponsorship: plataforma de comunidad"
client: "The Alumni Sponsorship"
sector: "Comunidad educativa"
summary: "Una red de exalumnos de dos colegios de Guayaquil pasó de manejar a sus graduados en hojas de cálculo a una plataforma propia con verificación, eventos, mentorías y un portal para cada exalumno."
order: 4
services: ["Plataformas a medida", "Limpieza y migración de datos", "Portal de miembros"]
metrics:
  - value: "2.986"
    label: "graduados en una sola base verificada"
  - value: "34% → 45%"
    label: "de vinculación en las primeras siete semanas"
  - value: "1 día"
    label: "para tener el primer prototipo funcional"
  - value: "1.749"
    label: "contactos históricos migrados"
aiBuild: "La plataforma completa se construyó con agentes de IA de ingeniería: el primer prototipo estuvo listo en un día y la versión con datos reales salió a producción en semanas. La IA también escribió y validó las reglas que limpiaron y cruzaron los casi 3.000 registros: cédulas mal digitadas, nombres separados al revés y más de cien formas distintas de escribir una carrera."
aiUse: "Dentro de la plataforma decidimos no usar IA, y fue una decisión de diseño: maneja datos personales de exalumnos, así que todo funciona con reglas verificables, sin enviar información a terceros y sin costo por uso. La IA se queda en el taller de Eclipxia, donde acelera cada mejora que el equipo pide."
image: "/casos/alumni-sponsorship-comunidad/tablero.jpg"
imageAlt: "Tablero de vinculación de la comunidad de exalumnos"
---

## La problemática y el objetivo

The Alumni Sponsorship mantiene unida a la red de exalumnos de dos colegios de Guayaquil. Su apuesta es convertir a los egresados en una comunidad activa: un directorio de profesionales, eventos, mentorías y beneficios para sus miembros. La meta es ambiciosa: que el 80% de los graduados esté vinculado.

La información estaba repartida en varias hojas de cálculo, sin historial de contactos y con validaciones manuales. Había cédulas confundidas con celulares, listas oficiales incompletas y un buscador web lento. Con un equipo pequeño y sin departamento de tecnología, cada evento o seguimiento costaba más trabajo del que debía.

## El planteamiento de Eclipxia

El cliente tenía sobre la mesa propuestas basadas en herramientas genéricas y conectores entre aplicaciones. Las evaluamos y propusimos otro camino: una plataforma propia donde los formularios viven dentro del sistema y la base es la única fuente de verdad, para que el dato entre limpio desde el primer momento.

Para que la decisión no fuera un acto de fe, construimos un prototipo funcional en un día y se lo mostramos al cliente. Luego trabajamos primero los datos: cruzamos cada exalumno contra las listas oficiales de graduados y recuperamos casi todas las cédulas que faltaban en la lista de uno de los colegios.

## La solución

**Para el equipo:**

- **Tablero de vinculación** hacia la meta del 80%, por promoción y colegio, con carreras, universidades y empresas.
- **Base de exalumnos** con buscador, filtros, exportación y el historial de contactos de cada persona.
- **Verificación inteligente:** cada registro nuevo se cruza contra las listas oficiales y los casos dudosos llegan a una cola con los candidatos más parecidos, para fusionar duplicados en segundos.
- **Eventos** con inscripción por cédula, control de asistencia y correos automáticos de confirmación, agradecimiento y "te extrañamos".
- **Mentorías** de punta a punta: postulación, asignación, seguimiento y calificación en ambos sentidos.
- **Patrocinadores y alianzas,** con una vista de datos agregados y anónimos para presentar la comunidad a auspiciantes.


<figure>
  <img src="/casos/alumni-sponsorship-comunidad/tablero.jpg" alt="Tablero con la vinculación de la comunidad, cobertura por promoción y por colegio" loading="lazy" width="1600" height="1017" />
  <figcaption>El tablero del equipo: avance hacia la meta, cobertura por promoción y actividad de la comunidad. Nombres de los colegios reemplazados.</figcaption>
</figure>

**Para cada exalumno,** un portal sin contraseñas, con acceso por enlace al correo, donde se inscribe a eventos, actualiza su perfil y encuentra a otros miembros. Los permisos se controlan en la base de datos, no solo en la pantalla.


<figure>
  <img src="/casos/alumni-sponsorship-comunidad/portal.jpg" alt="Pantalla de acceso al portal del exalumno, sin contraseña" loading="lazy" width="1200" height="1266" />
  <figcaption>El portal del exalumno: se entra con la cédula y un enlace al correo, sin contraseñas.</figcaption>
</figure>

La plataforma salió a producción en julio de 2026 con el 34% de los graduados vinculados y siete semanas después ya superaba el 45%.
