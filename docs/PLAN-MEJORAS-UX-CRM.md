# Plan de Mejoras UX - Quimera Olula CRM

**Fecha**: 10 de julio de 2026  
**Fuente**: Feedback de usuario experto en CRM  
**Versión**: 1.0

---

## 📊 Calificación General

| Aspecto | Puntuación | Notas |
|---------|-----------|-------|
| **Diseño** | 8.5/10 | Muy limpio, ágil, moderno |
| **Experiencia UX** | 6.5/10 | Obliga a entrar en fichas para actuar |
| **Orientación a ventas** | 6/10 | Más gestor de información que asistente comercial |
| **Potencial** | 9.5/10 | Base sólida para añadir inteligencia comercial |
| **Listados** | 9/10 | Excelente estructura |
| **Kanban Oportunidades** | 9/10 | Muy buena base, varias mejoras posibles |
| **Ficha de Oportunidad** | 8.5/10 | Limpia, necesita resumen visible arriba |
| **Acciones** | 9/10 | Widget muy promisorio |
| **Formularios** | 8.5/10 | Minimalistas, necesita detalles |
| **Filtros** | 6.5/10 | Funcionan pero sin elegancia visual |

**Insight crítico**: El sistema respira bien. No está sobrecargado. El reto es pasar de "gestor de datos" a "asistente comercial" que diga continuamente "haz esto".

---

## 🎯 Prioridad Estratégica

### Corto plazo (P0 - Semanas 1-2)
1. **Acciones rápidas desde Home** - Finalizar, posponer, llamar, email
2. **Quitar botón Borrar** de fichas (reemplazar por menú ...)
3. **Banda resumen en ficha de Oportunidad** - Info crítica sin scroll
4. **Indicador de tareas retrasadas** en Home (formato "4 retrasadas")

### Medio plazo (P1 - Semanas 3-6)
1. Rediseño tarjeta Kanban (más información, menos espacio vacío)
2. Acciones pendientes visibles en tarjeta
3. Historial visual en ficha de Oportunidad
4. Cambiar "Últimas oportunidades" por "Que requieren atención"
5. Indicadores comerciales (objetivo mensual, oportunidades estancadas)

### Largo plazo (P2 - Weeks 7+)
1. Acciones rápidas en Oportunidad (teléfono, email, reunión, tarea, nota)
2. Timeline completa de acciones
3. Kanban mobile mejorado
4. Resumen económico en cabecera
5. Estados de Acción más realistas
6. Nuevos tipos de Acción

---

## 🏠 HOME - Primera Impresión (Prioridad: P0)

**Problema actual**: "No sé qué es lo importante" - Demasiado peso visual igual en todo.

### Mejoras Inmediatas

#### 1. Línea de situación arriba (P0)
```
23 pendientes · 4 retrasadas · 6 para hoy
```
- Pone al comercial en situación al abrir la app
- Reemplaza o complementa el widget de Acciones
- Usa colores: gris (pendientes), rojo (retrasadas), naranja (hoy)

#### 2. Widget de Acciones Mejorado (P1)
El widget debe mostrar:
- ✅ Tipo (icono según tipo de acción) - FUNCIONA
- ✅ Cliente - FUNCIONA
- ✅ Fecha - FUNCIONA
- **NEW**: Hora (A las 9, A las 14, etc.)
- **NEW**: Estado de retraso (Retrasada hace 2 días / Hoy / Normal)
- **NEW**: Colores suaves distintos por tipo (email=azul, llamada=verde, visita=naranja, tarea=gris)

#### 3. Quitar Tarjetas de Clientes (P1)
- No aportan valor para un comercial
- Sustituir por indicadores de atención

#### 4. Reemplazar "Últimas Oportunidades" (P1)

**De:**
```
Últimas oportunidades creadas
```

**A:**
```
Oportunidades que requieren atención
- Vencen hoy
- Vencen esta semana
- Sin movimiento >10 días
- Cambiar criterio a ACCIÓN, no a TIEMPO DE CREACIÓN
```

#### 5. Añadir Indicadores Comerciales (P1)

**Mi objetivo del mes:**
```
Venta objetivo: 120.000 €
Llevas: 87.000 € (72%)
```
▓▓▓▓▓▓░░░░ 72%

**Embudo de oportunidades:**
```
15 → 8 → 4 → 2
```
Número de oportunidades por fase (no dinero)

**Alertas críticas:**
- Clientes sin contactar >30 días
- Oportunidades sin movimiento
- Presupuestos vencidos
- Emails sin responder

**Próxima reunión:**
- No una lista
- Solo la siguiente
- Con botón "Ir"

**Notificaciones sociales:**
```
Juan abrió el presupuesto
Pedro respondió
Ana aceptó la reunión
```

---

## 📋 WIDGET DE ACCIONES - Cambios Urgentes (Prioridad: P0-P1)

**Puntuación actual**: 9/10 base, mejorable en UX

### Lo que funciona ✅
- Icono según tipo
- Se distingue fecha
- Se distingue cliente
- Diseño limpio

### Mejoras Críticas

#### 1. Prioridad Visible (P1)
```
🔴 Urgente     (rojo)
🟠 Alta        (naranja)
🟡 Normal      (amarillo)
⚪ Baja        (gris)
```
- En un círculo pequeño antes del icono de tipo
- O en borde de tarjeta
- Comercial con 40 tareas puede decidir

#### 2. Hora (P0)
```
09:00 - Llamada a Kevin
14:30 - Visita a Almacén
18:00 - Reunión con Marketing
```
- Una llamada a las 9 NO es igual a visita a las 18
- Facilita planificación mental

#### 3. Indicador de Retraso (P0)
```
🔴 Hace 2 días
⚠️ Retrasada
🟠 Hoy
🟡 Mañana
```
- No solo mostrar fecha
- Mostrar relación con HOY
- Usa emojis/colores para escanear rápido

#### 4. Colores Distintos por Tipo (P1)
```
📧 Email     → Azul suave
☎️ Llamada   → Verde suave
📍 Visita    → Naranja suave
✓ Tarea     → Gris suave
```
- Muy discretos
- El cerebro identifica antes
- Evita monotonía visual

#### 5. Acciones Rápidas desde Home (P0) ⭐ MÁS IMPORTANTE

**Problema**: Pulso una llamada → se abre → tengo que darle a Finalizar. Demasiados pasos.

**Solución**: Acciones rápidas sin entrar en ficha

```
┌─ 09:00 Llamada a Kevin ────────────────────┐
│  Cliente: Acme Corp                        │
│  Empresa: Ventas                           │
│                                            │
│  [☎️ Llamar] [✓ Hecha] [→ Posponer] [✏️] │
└────────────────────────────────────────────┘
```

- **☎️ Llamar**: Abre marcador (si es móvil)
- **✓ Hecha**: Marca como finalizada instant
- **→ Posponer**: Abre mini-modal para elegir fecha
- **✏️**: Abre ficha completa

---

## 🎴 KANBAN OPORTUNIDADES - Rediseño Tarjeta (Prioridad: P1)

**Puntuación actual**: 9/10 estructura, pero tarjeta tiene espacio vacío

### Problema
Información muy separada, espacio vacío, no se ve trabajo pendiente.

### Nuevo layout (sin aumentar altura)

```
┌─────────────────────────────────────────┐
│  80%                  [📋]              │  ← Probabilidad | Indicadores
│  Rediseño web                           │  ← Título
│  Kevin Durant                           │  ← Cliente
│  📅 05/08/2026 | 🟢 48.000 €           │  ← Fecha + Importe con color
│  🔥 Vence en 5 días                     │  ← Urgencia
│  ☎️ 2 llamadas · 📧 1 email             │  ← Acciones pendientes
│  📊 3 acciones pendientes                │  ← Resumen (alternativa)
└─────────────────────────────────────────┘
```

### Cambios necesarios

#### 1. Densidad de información
- Acercar líneas
- Usar iconos para ahorrar texto
- Eliminar espacios entre secciones

#### 2. Acciones pendientes (P1)
Mostrar icono + número:
```
☎️ 2 llamadas
📧 1 email
📅 Reunión mañana
O simplemente: 📌 3 acciones pendientes
```
- Comercial sabe dónde actuar sin abrir ficha
- Crítico para productividad

#### 3. Indicadores pequeños arriba derecha (P1)
```
[💬]  ← Tiene observaciones
[📎]  ← Tiene documentos
[📌]  ← Tiene acciones
[🔄]  ← Tiene integraciones
```
- Reemplaza icono gris poco visible
- Cada uno tiene significado

#### 4. Colores de importe mejorados (P1)

**De:**
```
Verde (>=30k) ✅
Naranja (>=10k) ⚠️
Gris (<10k) ❌ Parece deshabilitado
```

**A:**
```
🟢 Verde        ← Alta probabilidad (>=75%)
🟠 Naranja      ← Media probabilidad (50-74%)
🔴 Rojo         ← Baja probabilidad (<50%)
⚫ Gris         ← Archivada
```

#### 5. Estados de vencimiento (P1)
```
🔴 Vencida hace 4 días
🟠 Vence hoy
🟡 Vence mañana
🟢 Dentro de 15 días
```
- Más rico que solo "🔥 Vence pronto"
- Visual ayuda a priorizar

---

## 📄 FICHA DE OPORTUNIDAD - Mejoras (Prioridad: P1)

**Puntuación actual**: 8.5/10

### Mejora Crítica: Banda Resumen Fija (P1)

**Arriba del todo, sin scroll:**
```
┌─────────────────────────────────────────────────┐
│  80%  Negociación  48.000 €  05 Aug  Kevin    │
└─────────────────────────────────────────────────┘
```

- Probabilidad | Estado | Importe | Fecha | Cliente
- SIEMPRE visible
- No necesitas scroll para saber dónde estás
- Diferencia de gama alta vs. básico

### Mejora 2: Pestaña Acciones con Botones Rápidos (P1)

**De:**
```
Lista de acciones
[Abrir detalle]
```

**A:**
```
Lista de acciones

Acciones rápidas:
[☎️ Llamar] [📧 Email] [📅 Nueva reunión] [✓ Nueva tarea] [📝 Nota]

Lista de acciones con detalles
```

- Comercial no cambia de pantalla
- Acciones inline en la misma pestaña
- Similar a Clientes

### Mejora 3: Timeline de Historial (P1)

Nueva pestaña o sección:

```
Hoy
☎️ Llamada realizada - Juan

Ayer
📧 Presupuesto enviado - Pedro

5 julio
📅 Reunión - Ana

2 julio
✨ Creación oportunidad - Juan
```

- Da contexto comercial valioso
- Ve evolución sin entrar en acciones
- Oro puro para decisiones

### Mejora 4: Datos Comerciales Completos (P1)

Agregar campos visibles:
- Empresa
- Contacto
- Responsable
- Duración prevista
- Recordatorio
- Hora
- Ubicación

---

## 💬 ACCIONES - Rediseño Estados y Tipos (Prioridad: P1)

### Estados Actuales (Problema)
```
Pendiente
Hecha
Borrador      ← ¿Qué pinta aquí?
```

Una acción "Borrador" no existe. Si no está lista, no existe.

### Estados Nuevos (Propuesta)
```
Pendiente      ← Esperando realizarse
En curso       ← En ejecución ahora
Hecha          ← Completada
Cancelada      ← No se hará
No realizada   ← Se pasó la fecha
Pospuesta      ← Movida a otra fecha
```

**Beneficio**: Refleja realidad comercial. Diferencia entre cancelada y no realizada es crítica.

### Tipos Actuales (Incompletos)
```
Email
Visita
Teléfono
Otro
Tarea
```

### Tipos Nuevos (Propuesta)
```
☎️ Llamada
📧 Email
📍 Visita
💻 Videollamada
🤝 Reunión
💬 WhatsApp
🔗 LinkedIn
📱 SMS
📄 Entrega documentación
✍️ Firma
🎬 Demostración
🔍 Seguimiento
✓ Tarea
```

Algunos pueden agruparse, pero separación inicial es mejor para filtros.

---

## 📝 FORMULARIOS - Mejoras (Prioridad: P1)

**Puntuación actual**: 8.5/10

### Formulario Nueva Acción (7/10 → 8.5/10)

**Actualmente vacío:**
```
Descripción: [_____________]
Fecha: [_____]
```

**Propuesta:**
```
Tipo*: [Llamada ▼]          [Prioridad: Normal ▼]
Descripción*: [______________]
Hora: [14:30]               [Recordatorio: 10 min antes]
Responsable: [Juan ▼]       [Estado: Pendiente ▼]

[Guardar] [Guardar y crear otra] [Cancelar]
```

- Campos obligatorios marcados con *
- Más campos = mejor registro
- Botón "Guardar y crear otra" → útil para registrar múltiples

### Mejoras Globales en Formularios (P1)

#### 1. Espaciado vertical en móvil
Etiquetas y líneas demasiado juntas. Más margen vertical.

#### 2. Indicador de obligatorios
```
* Campo obligatorio
o Campo opcional
```

#### 3. Botón Guardar fijo
En formularios largos, scroll hasta el final es incómodo.
```
[Scroll de contenido]
═════════════════════════════════
[Guardar] [Cancelar]
```

#### 4. Acciones rápidas contextuales
Si seleccionas cliente:
```
[Cliente: Acme Corp ▼]
[☎️ Llamar] [📧 Email] [💬 WhatsApp] [📋 Ficha]
```

Sin abandonar formulario.

#### 5. Historial en edición
```
─────────────────────────────
Creado por: Juan García
Fecha: 10/7/2026 09:30
Modificado: Ana López
Fecha: 10/7/2026 14:15
```

Da confianza y trazabilidad.

---

## 🔍 FILTROS - Rediseño Visual (Prioridad: P1)

**Puntuación actual**: 6.5/10

### Problema
Funcionan pero sin elegancia. Parecen un formulario normal, no un sistema de filtros.

### Nuevo diseño (Estilo HubSpot)

```
FILTROS ACTIVOS: 3

┌─ Estado ─────────────────────┐
│ ☑️ Pendiente                 │
│ ☐ Hecha                      │
│ ☐ Borrador                   │
└──────────────────────────────┘

┌─ Tipo ───────────────────────┐
│ ☑️ Llamada                   │
│ ☐ Email                      │
│ ☐ Visita                     │
│ ☐ Tarea                      │
└──────────────────────────────┘

┌─ Fecha ──────────────────────┐
│ Desde: [10/7/2026]           │
│ Hasta: [15/7/2026]           │
└──────────────────────────────┘

┌─ Cliente ────────────────────┐
│ [Buscador________________]   │
│ • Acme Corp (5 acciones)    │
│ • Tech Ltd (3 acciones)     │
└──────────────────────────────┘

[Buscar] [Limpiar filtros]
```

### Cambios

#### 1. Agrupar por bloques
Tipo, Estado, Fecha, Cliente, etc.
- Visual más clara
- Escanear rápido

#### 2. Resumen arriba
```
3 filtros activos
```
- No botones con X esparcidos
- Una línea clara

#### 3. Botones más grandes
```
[Buscar] [Limpiar]
```
- Ocupan más ancho
- Cómodos en móvil
- Botón primario (azul) + secundario (gris)

#### 4. Checkboxes, no selector
- Más intuitivos
- Permiten multi-selección clara

---

## 📱 KANBAN MÓVIL (Prioridad: P2)

**Problema**: No poder arrastrar tarjetas es incómodo.

### Solución

#### Opción A: Mantener pulsada + arrastrar
- Estándar en móvil
- Requiere UX clara (visual feedback)

#### Opción B: Menú "Mover a..."
```
┌─────────────────────┐
│ 🔽 Mover a estado:  │
│                     │
│ • Calificación      │
│ • Contacto          │
│ • Propuesta         │
│ • Negociación       │
│ • Ganada            │
│ • Perdida           │
└─────────────────────┘
```

- No obliga a entrar en ficha
- Accesible en un tap

### Implementar ambas
- Drag para usuarios avanzados (escritorio)
- Menú para móvil (fallback siempre disponible)

---

## 💡 OBSERVACIONES FINALES

### Fortalezas del Sistema
✅ **Diseño limpio** - Respira bien, no sobrecargado  
✅ **Agilidad** - Formularios minimalistas  
✅ **Base sólida** - Arquitectura sin complicaciones innecesarias  
✅ **Enfoque comercial** - Canales, pipelines, probabilidad bien pensados  

### El Mayor Reto
> "Todo está centrado en almacenar datos. No en ayudar a vender."

Un CRM moderno debe decir continuamente:
```
"Haz esto."
```

No solo:
```
"Aquí están tus datos."
```

### Visión a Largo Plazo
Quimera Olula está en posición de competir con Pipedrive o HubSpot para pymes.

**Lo que le falta ya no son grandes funcionalidades, sino detalles de productividad:**

1. ✅ Acciones rápidas (sin entrar en fichas)
2. ✅ Alertas inteligentes (qué es urgente)
3. ✅ Resumen siempre visible (sin scroll)
4. ✅ Historial contextual (qué pasó antes)
5. ✅ Indicadores comerciales (cómo va el mes)

### Consejo Estratégico
Mantén la filosofía actual: cada elemento debe responder a una pregunta que un comercial se hace al empezar el día:

> **"¿Qué tengo que hacer ahora mismo para vender más?"**

Si cada pantalla, cada widget, cada botón responde a eso, has ganado.

---

## 📋 Checklist Implementación

### Fase 1 (Semanas 1-2) P0
- [ ] Línea de situación en Home ("23 pendientes · 4 retrasadas · 6 para hoy")
- [ ] Acciones rápidas desde Home (Llamar, Hecha, Posponer, Editar)
- [ ] Quitar botón Borrar de fichas (menú ... en su lugar)
- [ ] Indicador de hora en Acciones
- [ ] Indicador de retraso en Acciones

### Fase 2 (Semanas 3-6) P1
- [ ] Banda resumen fija en Oportunidad
- [ ] Rediseño tarjeta Kanban (acciones pendientes visibles)
- [ ] Colores mejorados en importe (rojo para baja)
- [ ] Estados de vencimiento enriquecidos
- [ ] Timeline de historial en Oportunidad
- [ ] Botones rápidos en pestaña Acciones de Oportunidad
- [ ] Cambiar "Últimas oportunidades" por "Que requieren atención"
- [ ] Nuevo layout de filtros (bloques, checkboxes)
- [ ] Quitar Tarjetas de Clientes de Home
- [ ] Indicadores comerciales (objetivo, embudo, alertas)

### Fase 3 (Semanas 7+) P2
- [ ] Nuevos estados de Acción
- [ ] Nuevos tipos de Acción
- [ ] Acciones rápidas en Oportunidad (teléfono, email, reunión, nota)
- [ ] Resumen económico en cabecera
- [ ] Kanban móvil mejorado (drag o menú)
- [ ] Indicadores pequeños en tarjeta Kanban (💬 📎 📌)
- [ ] Formulario Nueva Acción mejorado
- [ ] Historial en edición de formularios

---

**Próxima revisión**: Después de implementar Fase 1  
**Contacto para feedback**: [Información de contacto del usuario]
