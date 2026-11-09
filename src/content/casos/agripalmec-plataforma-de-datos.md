---
title: "Del dato escrito tres veces al reporte que se pide conversando"
seoTitle: "Agripalmec: plataforma de datos agrícolas con IA"
client: "Agripalmec"
sector: "Agroindustria · Palma"
summary: "Una empresa palmicultora reemplazó formularios, una base de datos de escritorio, hojas de cálculo y un tablero de actualización mensual por una sola plataforma. Gerencia ahora pide sus reportes en vivo conversando con la IA."
order: 3
services: ["Ingeniería de datos", "Plataformas a medida", "Conector de IA para gerencia"]
metrics:
  - value: "≈ 40 h"
    label: "al mes de digitación eliminadas (estimación)"
  - value: "6 semanas"
    label: "de la primera versión a producción"
  - value: "+350 mil"
    label: "registros históricos migrados desde 2020"
  - value: "1 vez"
    label: "se escribe cada dato, donde ocurre"
aiBuild: "La plataforma se construyó con agentes de IA de ingeniería. Eso permitió pasar de la primera versión a producción en seis semanas y conciliar al centavo más de 600 mil filas del sistema anterior, un trabajo de auditoría que a mano habría tomado meses."
aiUse: "Abrimos un conector MCP para que los gerentes consulten la plataforma desde Claude en lenguaje natural: preguntan por producción, mano de obra o costos y reciben el informe al momento, con datos vivos y sin exportar nada. El acceso es de solo lectura y cada consulta queda registrada."
note: "Por confidencialidad del cliente, este caso no detalla las reglas de cálculo ni las cifras internas de la operación."
image: "/casos/agripalmec-plataforma-de-datos/integracion.jpg"
imageAlt: "Las tres plataformas anteriores integradas en una sola"
---

## La problemática y el objetivo

En Agripalmec cada dato de campo se escribía al menos dos veces y pasaba por herramientas que no se hablaban entre sí. Los jefes de campo llenaban formularios, en la oficina alguien los volvía a digitar uno por uno en una base de datos de escritorio, luego se exportaba a hojas de cálculo para ordenarlo a mano y, al final, alimentaba un tablero que se actualizaba una vez al mes.

El costo no era solo de tiempo. La base vivía en un único computador, los respaldos no siempre protegían los datos y no quedaba registro de quién cambiaba qué. Gerencia tomaba decisiones con la última exportación disponible, no con lo que estaba pasando en el campo.


<figure>
  <img src="/casos/agripalmec-plataforma-de-datos/antes.jpg" alt="Formularios, base de datos de escritorio y tablero de reportes que no se conectaban" loading="lazy" width="1600" height="1042" />
  <figcaption>El punto de partida: tres herramientas que no se hablaban.</figcaption>
</figure>

El objetivo fue simple de enunciar: que cada dato se escriba una sola vez, donde ocurre, y que todos vean lo mismo.

## El planteamiento de Eclipxia

Lo tratamos como un proyecto de ingeniería de datos antes que de software. Primero auditamos: revisamos decenas de hojas de cálculo y documentamos los problemas de calidad que distorsionaban los reportes, algunos con cifras contadas varias veces. Con eso diseñamos un modelo de datos nuevo y migramos el histórico completo desde 2020, cuadrado al centavo contra el sistema anterior.

Solo entonces construimos encima, por fases: la aplicación de campo, la consola de gestión, los reportes y, al final, el conector de IA. El cliente decidió en el camino retirar por completo el sistema anterior, y el plan lo absorbió sin reiniciar.

## La solución

**Lo que se reemplazó:**

- Formularios en papel y hojas compartidas → una aplicación en el celular de los jefes de campo, que funciona sin señal.
- Una base de datos en un solo computador → una plataforma en la nube con respaldo diario, acceso por rol y bitácora de cada cambio.
- Cálculos armados a mano en hojas de cálculo → procesos calculados y cuadrados dentro del sistema.
- Un tablero de actualización mensual → los mismos indicadores, al día, con exportación a Excel y PDF.


<figure>
  <img src="/casos/agripalmec-plataforma-de-datos/integracion.jpg" alt="App de campo, aprobación, base única en la nube y consola de reportes" loading="lazy" width="1600" height="1042" />
  <figcaption>Hoy: el dato entra una vez, en el campo, y de ahí sale todo lo demás.</figcaption>
</figure>

<figure>
  <img src="/casos/agripalmec-plataforma-de-datos/app-campo.jpg" alt="Pantalla de ingreso de la aplicación de campo de Agripalmec en un celular" loading="lazy" width="1600" height="980" />
  <figcaption>La aplicación de campo: los jefes registran el trabajo donde ocurre, incluso sin señal.</figcaption>
</figure>

**Cómo funciona ahora.** El jefe de campo registra donde ocurre el trabajo, la oficina revisa y aprueba, el sistema hace los cálculos y gerencia aprueba al final. Nadie vuelve a digitar lo que ya se escribió una vez.

**Reportes conversando con la IA.** Los gerentes agregan el conector MCP de Agripalmec a Claude y preguntan como le preguntarían a un analista. Por ejemplo: "¿Cuánto se cosechó en esta división en septiembre y cuánto costó la mano de obra?". La IA consulta la plataforma en ese momento y responde con el informe o el gráfico. El conector solo puede leer, no ve datos personales y nunca reemplaza al sistema como fuente oficial para pagos.


<figure>
  <img src="/casos/agripalmec-plataforma-de-datos/conector-ia.jpg" alt="Ejemplo de consulta en lenguaje natural a través del conector MCP" loading="lazy" width="1600" height="1042" />
  <figcaption>Así se consulta: se pregunta en lenguaje natural, la IA lee la plataforma y responde con los mismos datos de la consola.</figcaption>
</figure>

El ahorro más visible está en la oficina: solo la digitación de registros de labor representaba unas 40 horas al mes, según la estimación hecha con el volumen real de 2025. A eso se suman el armado manual de cálculos y las exportaciones mensuales, que también desaparecieron.

La plataforma está en producción desde octubre de 2026.
