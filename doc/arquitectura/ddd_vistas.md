# Guía de Desarrollo de Vistas - Filosofía de Arquitectura

## Introducción

Este documento describe la filosofía de desarrollo utilizada en Quimera Ólula, basada en una arquitectura modular y orientada a máquinas de estado. Se ilustra con ejemplos reales de presupuestos y ventas TPV.

---

## 1. Estructura General de Carpetas

### Patrón Recomendado
```
modulo/
├── diseño.ts              # Interfaces y tipos
├── dominio.ts             # Lógica de negocio compartida
├── infraestructura.ts     # Llamadas a API
├── comun/
│   └── urls.ts           # URLs de API
├── maestro/               # Vista listado
│   ├── maquina.ts
│   ├── dominio.ts
│   ├── diseño.ts
│   └── MaestroConDetalle{Modulo}.tsx
├── detalle/               # Vista detalle/edición
│   ├── maquina.ts
│   ├── dominio.ts
│   ├── diseño.ts
│   └── Detalle{Modulo}.tsx
├── crear/                 # Modal de creación
│   ├── dominio.ts
│   └── Crear{Modulo}.tsx
├── borrar/                # Modal de borrado
│   └── Borrar{Modulo}.tsx
└── [otras-operaciones]/   # Modales para acciones específicas
```

### Observación Importante
La plantilla sigue este patrón correctamente. **Presupuesto** y **VentaTpv** siguen esta estructura fielmente.

---

## 2. Capas de Arquitectura

### 2.1 Capa de Diseño (diseño.ts)

**Responsabilidad:** Definir tipos e interfaces TypeScript.

**Contenidos:**
- Interfaces principales de la entidad
- Interfaces para respuestas de API (pueden ser diferentes)
- Tipos para crear nuevos registros (sin ID)
- Tipos de funciones para infraestructura (contratos)

**Ejemplo Real - Presupuesto:**
```typescript
export interface Presupuesto extends Venta {
  fecha_salida: Date;
  aprobado: boolean;
  lineas: LineaPresupuesto[];
}

export interface PresupuestoAPI {
  // Campos del API (puede usar strings para fechas)
  fecha_salida: string;
  // ...
}

export type NuevoPresupuesto = {
  cliente_id: string;
  direccion_id: string;
  empresa_id: string;
}
```

**Ejemplo Real - VentaTpv:**
```typescript
export interface VentaTpv extends Venta {
    pendiente: number;
    pagado: number;
    puntoVentaId: string;
    abierta: boolean;
}

export type NuevaVentaTpv = {
    agente_id: string;
    punto_venta_id: string;
}
```

**Patrón Clave:**
- ✅ Separar tipos de dominio de tipos de API
- ✅ Crear interfaces específicas para operaciones (Nuevo*, Cambio*, etc.)
- ✅ Heredar de interfaces base cuando sea posible

---

### 2.2 Capa de Infraestructura (infraestructura.ts)

**Responsabilidad:** Comunicación con la API REST.

**Contenidos:**
- Mapeo de tipos (API → Dominio)
- Operaciones CRUD
- Transformación de datos

**Ejemplo Real - Presupuesto:**
```typescript
// Mapeo: API → Dominio
export const presupuestoFromAPI = (p: PresupuestoAPI): Presupuesto => ({
  ...p,
  fecha: new Date(Date.parse(p.fecha)),           // String → Date
  fecha_salida: new Date(Date.parse(p.fecha_salida)),
  nombre_via: p.direccion?.nombre_via ?? "",      // Extrae direccion.nombre_via
  // ...
});

// Mapeo: Dominio → API
export const presupuestoToAPI = (l: Presupuesto): PresupuestoAPI => {
  const { direccion, ...rest } = l;
  return {
    ...rest,
    fecha: rest.fecha.toISOString(),               // Date → String
    fecha_salida: rest.fecha_salida.toISOString(),
    direccion: {
      nombre_via: direccion?.nombre_via ?? "",
      // ...
    },
  };
};

// Operación: GET
export const getPresupuesto: GetPresupuesto = async (id) =>
  RestAPI.get<{ datos: PresupuestoAPI }>(`${baseUrl}/${id}`)
    .then((respuesta) => presupuestoFromAPI(respuesta.datos));
```

**Patrón Clave:**
- ✅ Funciones de mapeo explícitas (fromAPI, toAPI)
- ✅ Transformar tipos (Date, conversiones)
- ✅ Usar RestAPI helper
- ✅ Manejo consistente de errores

---

### 2.3 Capa de Dominio (dominio.ts)

**Responsabilidad:** Lógica de negocio, nunca debe hablar directamente con API.

**Se divide en:**
- **dominio.ts raíz:** Lógica compartida
- **maestro/dominio.ts:** Lógica de listado
- **detalle/dominio.ts:** Lógica de edición
- **crear/dominio.ts:** Configuración de formularios
- **[operacion]/[operacion].ts:** Lógica específica

#### 2.3.1 Dominio Raíz (modulo/dominio.ts)

Contiene metadatos y funciones compartidas.

**Ejemplo Real - Presupuesto:**
```typescript
export const metaPresupuesto: MetaModelo<Presupuesto> = {
    campos: {
        tasa_conversion: { tipo: "numero", requerido: false },
        total_divisa_empresa: { tipo: "numero", bloqueado: true },
        codigo: { bloqueado: true },
        // ...
    },
};

export const metaLineaVenta: MetaModelo<LineaVenta> = {
    campos: {
        cantidad: { tipo: "numero", requerido: true },
        pvp_unitario: { tipo: "moneda", requerido: true },
        dto_porcentual: { tipo: "numero", requerido: false },
        referencia: { requerido: true },
    }
};
```

**Patrón Clave:**
- ✅ MetaModelo: Define validaciones, tipos de campos, si es editable
- ✅ Valores vacíos: `moduloVacio()` para inicialización
- ✅ Compartir entre maestro, detalle y crear

#### 2.3.2 Dominio del Maestro (maestro/dominio.ts)

Gestiona la lista de entidades.

**Ejemplo Real - Presupuesto:**
```typescript
type ProcesarPresupuestos = ProcesarContexto<EstadoMaestroPresupuesto, ContextoMaestroPresupuesto>;

// Patrón: Usar accionesListaEntidades para CRUD genérico
const conPresupuestos = (fn: ProcesarListaEntidades<Presupuesto>) => 
  (ctx: ContextoMaestroPresupuesto) => ({ ...ctx, presupuestos: fn(ctx.presupuestos) });

export const Presupuestos = accionesListaEntidades(conPresupuestos);
// Genera automáticamente: cambiar, activar, desactivar, incluir, quitar, recargar

// Operación custom: recargar desde API
export const recargarPresupuestos: ProcesarPresupuestos = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getPresupuestos(criteria.filtro, criteria.orden, criteria.paginacion);
    return Presupuestos.recargar(contexto, resultado);
}
```

**Patrón Clave:**
- ✅ `ProcesarContexto<Estado, Contexto>`: Tipo para handlers
- ✅ `accionesListaEntidades()`: Generador de acciones CRUD
- ✅ Funciones custom para operaciones específicas
- ✅ Nunca llama a API directamente, importa de infraestructura

#### 2.3.3 Dominio del Detalle (detalle/dominio.ts)

Gestiona la edición de una entidad individual.

**Ejemplo Real - VentaTpv:**
```typescript
export type EstadoVentaTpv = (
    'INICIAL' | "ABIERTA" | "EMITIDA"
    | "BORRANDO_VENTA"
    | "PAGANDO_EN_EFECTIVO" | "PAGANDO_CON_TARJETA"
    // ...
);

export type ContextoVentaTpv = {
    estado: EstadoVentaTpv,
    venta: VentaTpv;
    pagos: ListaEntidades<PagoVentaTpv>
    lineas: ListaEntidades<LineaFactura>;
};

type ProcesarVentaTpv = ProcesarContexto<EstadoVentaTpv, ContextoVentaTpv>;

const pipeVentaTpv = ejecutarListaProcesos<EstadoVentaTpv, ContextoVentaTpv>;

// Handler: Cargar la venta
const cargarVenta: (_: string) => ProcesarVentaTpv = (idVenta) =>
    async (contexto) => {
        const venta = await getVenta(idVenta);
        return {
            ...contexto,
            venta,
            ventaInicial: venta
        }
    }

// Handler: Refrescar cabecera desde API
export const refrescarCabecera: ProcesarVentaTpv = async (contexto) => {
    const venta = await getVenta(contexto.venta.id);
    return [
        {
            ...contexto,
            venta,
            ventaInicial: venta
        },
        [["venta_cambiada", venta]]  // Publicar evento al maestro
    ]
}
```

**Patrón Clave:**
- ✅ Define Estados y Contexto específicos
- ✅ Handlers que retornan contexto actualizado
- ✅ Puede retornar array [contexto, [[evento, payload]]]
- ✅ `ejecutarListaProcesos`: Encadena múltiples handlers

#### 2.3.4 Dominio de Crear (crear/dominio.ts)

Solo metadatos del formulario de creación.

**Ejemplo Real - Presupuesto:**
```typescript
export const metaNuevoPresupuesto: MetaModelo<NuevoPresupuesto> = {
    campos: {
        cliente_id: { requerido: true },
        direccion_id: { requerido: true },
        empresa_id: { requerido: true },
    },
};

export const nuevoPresupuestoVacio = (): NuevoPresupuesto => ({
    cliente_id: "",
    direccion_id: "",
    empresa_id: "1",
});
```

**Patrón Clave:**
- ✅ MetaModelo específico para crear
- ✅ Puede diferir del metaModulo de edición
- ✅ Valor inicial vacío

---

### 2.4 Capa de Máquinas de Estado (maquina.ts)

**Responsabilidad:** Definir transiciones entre estados y qué lógica ejecutar.

**NO es lógica de negocio**, es orquestación.

#### 2.4.1 Máquina del Maestro (maestro/maquina.ts)

**Ejemplo Real - Presupuesto:**
```typescript
export const getMaquina: () => Maquina<EstadoMaestroPresupuesto, ContextoMaestroPresupuesto> = () => {
    return {
        INICIAL: {
            presupuesto_cambiado: Presupuestos.cambiar,
            presupuesto_seleccionado: [Presupuestos.activar],
            presupuesto_deseleccionado: Presupuestos.desactivar,
            presupuesto_borrado: Presupuestos.quitar,
            presupuesto_creado: Presupuestos.incluir,
            recarga_de_presupuestos_solicitada: recargarPresupuestos,
            crear_presupuesto_solicitado: 'CREANDO_PRESUPUESTO',
        },
        
        CREANDO_PRESUPUESTO: {
            presupuesto_creado: [Presupuestos.incluir, 'INICIAL'],
            creacion_presupuesto_cancelada: 'INICIAL',
        },
    };
};
```

**Patrón Clave:**
- ✅ Estados simples (INICIAL, CREANDO_PRESUPUESTO)
- ✅ Transiciones: evento → handler o nuevo estado
- ✅ `[handler1, handler2, 'ESTADO']` ejecuta handlers en orden luego cambia estado
- ✅ El maestro tiene pocos estados (solo listado)

#### 2.4.2 Máquina del Detalle (detalle/maquina.ts)

**Ejemplo Real - VentaTpv:**
```typescript
export const getMaquina: () => Maquina<EstadoVentaTpv, ContextoVentaTpv> = () => {
    return {
        INICIAL: {
            venta_id_cambiada: [cargarContexto],
            venta_deseleccionada: [getContextoVacio, publicar('venta_deselaccionada', null)]
        },

        ABIERTA: {
            linea_creada: [refrescarCabecera, refrescarLineas],
            alta_linea_solicitada: "CREANDO_LINEA",
            baja_linea_solicitada: "BORRANDO_LINEA",
            cambio_cliente_solicitado: "CAMBIANDO_CLIENTE",
            borrar_solicitado: "BORRANDO_VENTA",
            pago_efectivo_solicitado: "PAGANDO_EN_EFECTIVO",
            // ...
        },

        CAMBIANDO_CLIENTE: {
            cliente_cambiado: [refrescarCabecera, refrescarLineas, "ABIERTA"],
            cambio_cliente_cancelado: "ABIERTA",
        },

        BORRANDO_VENTA: {
            venta_borrada: onVentaBorrada,
            borrado_de_venta_cancelado: "ABIERTA",
        },

        PAGANDO_EN_EFECTIVO: {
            pago_en_efectivo_hecho: [refrescarCabecera, refrescarPagos, abiertaOEmitidaContexto],
            pago_cancelado: "ABIERTA",
        },
        // ... más estados
    };
};
```

**Patrón Clave:**
- ✅ Múltiples estados (INICIAL, ABIERTA, EMITIDA, BORRANDO_*, PAGANDO_*)
- ✅ Transiciones explícitas entre estados
- ✅ Handlers ejecutados antes de cambiar estado
- ✅ `publicar('evento', payload)`: Envía al maestro

**Diferencia Importante con Plantilla:**

La plantilla es **demasiado simple**. VentaTpv es más realista con:
- Múltiples sub-estados por operación (PAGANDO_EN_EFECTIVO, PAGANDO_CON_TARJETA, etc.)
- Estados para operaciones larga (BORRANDO_VENTA, CAMBIANDO_CLIENTE)
- Contexto con múltiples listas (lineas, pagos)

---

## 3. Componentes React

### 3.1 Componente Maestro (maestro/MaestroConDetalle{Modulo}.tsx)

**Responsabilidad:** Orquestar la vista de listado + detalle.

**Ejemplo Real - Presupuesto:**
```tsx
export const MaestroConDetallePresupuesto = () => {
  const { ctx, emitir } = useMaquina(getMaquina, {
    estado: "INICIAL",
    presupuestos: listaEntidadesInicial<Presupuesto>(),
  });

  const setSeleccionada = useCallback(
    (payload: Presupuesto) => void emitir("presupuesto_seleccionado", payload),
    [emitir]
  );

  const recargar = useCallback(
    (criteria: Criteria) => {
      void emitir("recarga_de_presupuestos_solicitada", criteria);
    },
    [emitir]
  );

  useEffect(() => {
    emitir("recarga_de_presupuestos_solicitada", criteriaDefecto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Presupuesto">
      <MaestroDetalleControlado<Presupuesto>
        Maestro={<>
          <h2>Presupuestos</h2>
          <QBoton onClick={() => emitir("crear_presupuesto_solicitado")}>
            Nuevo Presupuesto
          </QBoton>
          <ListadoControlado {...} />
        </>}
        Detalle={
          <DetallePresupuesto
            presupuestoInicial={ctx.presupuestos.activo}
            publicar={emitir}
          />
        }
        seleccionada={ctx.presupuestos.activo}
      />

      <CrearPresupuesto
        publicar={emitir}
        onCancelar={() => emitir("creacion_presupuesto_cancelada")}
        activo={ctx.estado === "CREANDO_PRESUPUESTO"}
      />
    </div>
  );
};
```

**Patrón Clave:**
- ✅ `useMaquina(getMaquina, contextoInicial)`
- ✅ `useCallback` para estabilizar callbacks
- ✅ `useEffect` para cargar datos (con eslint-disable)
- ✅ `publicar={emitir}` pasa el emisor al detalle
- ✅ Modales como `<CrearPresupuesto>` mostrados según estado

---

### 3.2 Componente Detalle (detalle/Detalle{Modulo}.tsx)

**Responsabilidad:** Mostrar y editar una entidad.

**Patrón Clave:**
- ✅ Recibe `publicar` como prop
- ✅ Emite eventos a maestro: `publicar("evento", payload)`
- ✅ Usa `useMaquina` del detalle
- ✅ Muestra diferentes UI según estado

---

### 3.3 Componente Crear (crear/Crear{Modulo}.tsx)

**Responsabilidad:** Modal para crear nuevo registro.

**Ejemplo Real - Presupuesto:**
```tsx
export const CrearPresupuesto = ({
  publicar = async () => {},
  activo = false,
  onCancelar = () => {},
}: {
  publicar?: EmitirEvento;
  activo: boolean;
  onCancelar?: () => void;
}) => {
  const [modoNoRegistrado, setModoNoRegistrado] = useState(false);
  const presupuestoRegistrado = useModelo(
    metaNuevoPresupuesto,
    nuevoPresupuestoVacio
  );

  const guardar = async () => {
    const id = await intentar(() => postPresupuesto(presupuestoRegistrado.modelo));
    const presupuesto = await getPresupuesto(id);
    publicar("presupuesto_creado", presupuesto);  // 🔑 Evento al maestro
    presupuestoRegistrado.init(nuevoPresupuestoVacio);
  };

  const cancelar = () => {
    presupuestoRegistrado.init(nuevoPresupuestoVacio);
    onCancelar();
  };

  return (
    <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
      {/* Formulario */}
    </Mostrar>
  );
};
```

**Patrón Clave:**
- ✅ Llama a API directamente (no a dominio)
- ✅ Emite evento cuando termina: `publicar("modulo_creado", nuevoRegistro)`
- ✅ Recibe `activo` para mostrar/ocultar modal
- ✅ Limpia formulario en cancelar/guardar

---

### 3.4 Componente Borrar (borrar/Borrar{Modulo}.tsx)

**Responsabilidad:** Modal de confirmación para borrado.

**Ejemplo Real - Presupuesto:**
```tsx
export const BorrarPresupuesto = ({
  publicar,
  presupuesto,
}: {
  publicar: (evento: string, payload?: unknown) => void;
  presupuesto: Presupuesto;
}) => {
  const { intentar } = useContext(ContextoError);

  const borrar = async () => {
    if (presupuesto.id) {
      await intentar(() => borrarPresupuesto(presupuesto.id));
    }
    publicar("borrado_de_presupuesto_listo");  // Evento a detalle
  };

  return (
    <QModalConfirmacion
      nombre="confirmarBorrarPresupuesto"
      abierto={true}
      titulo="Confirmar borrar"
      mensaje="¿Estará seguro?"
      onCerrar={() => publicar("borrar_presupuesto_cancelado")}
      onAceptar={borrar}
    />
  );
};
```

**Patrón Clave:**
- ✅ Emite eventos para máquina: `borrado_de_presupuesto_listo` y `borrar_presupuesto_cancelado`
- ✅ Llama a API directamente
- ✅ Muy simple, solo confirmación

---

## 4. Flujo de Eventos y Comunicación

### 4.1 Eventos en Maestro

```
Usuario hace clic "Nuevo"
    ↓
Maestro emite: crear_presupuesto_solicitado
    ↓
Máquina cambia a: CREANDO_PRESUPUESTO
    ↓
UI: <CrearPresupuesto activo={true} />
    ↓
Usuario completa y guarda
    ↓
CrearPresupuesto emite: presupuesto_creado {presupuesto}
    ↓
Máquina ejecuta: Presupuestos.incluir (agrega a lista)
    ↓
Máquina cambia a: INICIAL
    ↓
Lista actualizada automáticamente
```

### 4.2 Eventos en Detalle

```
Detalle emite: edicion_de_presupuesto_lista {presupuesto}
    ↓
Máquina ejecuta: cambiarPresupuesto (actualiza API)
    ↓
Máquina emite al maestro: publicar("presupuesto_cambiado", presupuesto)
    ↓
Maestro recibe evento: presupuesto_cambiado
    ↓
Máquina maestro ejecuta: Presupuestos.cambiar (actualiza lista)
```

### 4.3 Eventos de Borrado

```
Detalle emite: borrar_solicitado
    ↓
Máquina detalle cambia a: BORRANDO_PRESUPUESTO
    ↓
<BorrarPresupuesto activo={true} />
    ↓
Usuario confirma
    ↓
BorrarPresupuesto emite: borrado_de_presupuesto_listo
    ↓
Máquina detalle ejecuta: borrarPresupuesto (API DELETE)
    ↓
Máquina emite: publicar("presupuesto_borrado", id)
    ↓
Maestro recibe: presupuesto_borrado
    ↓
Máquina maestro ejecuta: Presupuestos.quitar (elimina de lista)
```

---

## 5. Diferencias Plantilla vs Realidad

### 5.1 Dominio del Detalle

**Plantilla (Simplificada):**
```typescript
export const entrarEnEdicion: ProcesarDetalle = async (contexto) => {
    return { ...contexto, estado: 'EDITANDO' };
};
```

**Realidad (VentaTpv - Compleja):**
```typescript
export type EstadoVentaTpv = (
    'INICIAL' | "ABIERTA" | "EMITIDA"
    | "BORRANDO_VENTA"
    | "PAGANDO_EN_EFECTIVO" | "PAGANDO_CON_TARJETA" | "PAGANDO_CON_VALE"
    | "BORRANDO_PAGO" | "CAMBIANDO_CLIENTE"
    | "CREANDO_LINEA" | "BORRANDO_LINEA" | "CAMBIANDO_LINEA"
    | "DEVOLVIENDO_VENTA"
);

export type ContextoVentaTpv = {
    estado: EstadoVentaTpv,
    venta: VentaTpv;
    pagos: ListaEntidades<PagoVentaTpv>
    lineas: ListaEntidades<LineaFactura>;
};
```

**Aprendizaje:**
- ✅ Los detalles pueden tener **múltiples estados**
- ✅ Pueden tener **múltiples listas** (lineas, pagos)
- ✅ Pueden tener **sub-estados** por operación

### 5.2 Handlers Complejos

**Plantilla (Simple):**
```typescript
export const guardarModulo: ProcesarDetalle = async (contexto) => {
    await patchModulo(contexto.modulo.id, contexto.modulo);
    return { ...contexto, moduloInicial: contexto.modulo, estado: 'ABIERTO' };
};
```

**Realidad (VentaTpv):**
```typescript
export const refrescarCabecera: ProcesarVentaTpv = async (contexto) => {
    const venta = await getVenta(contexto.venta.id);
    return [
        { ...contexto, venta, ventaInicial: venta },
        [["venta_cambiada", venta]]  // Publicar evento al maestro
    ]
}
```

**Aprendizaje:**
- ✅ Los handlers pueden retornar `[contexto, eventos]`
- ✅ Los eventos se publican después del handler

---

## 6. Recomendaciones para la Plantilla

### ✅ Lo que está bien:

1. **Separación clara de capas:** diseño, infraestructura, dominio, máquina, componentes
2. **Uso de tipos:** MetaModelo, ProcesarContexto
3. **Patrón maestro/detalle:** Separación correcta
4. **Eventos y máquinas:** Uso de eventos para comunicación

### ⚠️ Mejoras sugeridas:

1. **Agregar ejemplo de múltiples estados en detalle:**
   - No solo ABIERTO/EDITANDO/GUARDANDO
   - Incluir estados para operaciones (BORRANDO_*, CREANDO_*)

2. **Mostrar contexto más complejo:**
   - Con múltiples listas (como VentaTpv con pagos + lineas)
   - No solo una lista simple

3. **Handlers que publican eventos:**
   ```typescript
   // Agregar ejemplo:
   return [contexto, [["evento", payload]]]
   ```

4. **Documentar `accionesListaEntidades`:**
   - Es fundamental y la plantilla no lo explica bien
   - Genera: cambiar, activar, desactivar, incluir, quitar, recargar

5. **Pipes y ejecución de listas:**
   ```typescript
   const pipeModulo = ejecutarListaProcesos<EstadoModulo, ContextoModulo>;
   ```

---

## 7. Checklist para Crear una Nueva Vista

- [ ] ¿Tengo tipos claros en `diseño.ts`?
- [ ] ¿Tengo mapeos fromAPI/toAPI en `infraestructura.ts`?
- [ ] ¿He definido el `MetaModelo` en `dominio.ts`?
- [ ] ¿Uso `accionesListaEntidades` en `maestro/dominio.ts`?
- [ ] ¿He definido todos los estados en `detalle/diseño.ts`?
- [ ] ¿Mi máquina tiene transiciones claras?
- [ ] ¿Los eventos son semánticos (ej: `presupuesto_creado`, no `ok`)?
- [ ] ¿El maestro emite eventos correctos?
- [ ] ¿El detalle emite `publicar("evento")` al maestro?
- [ ] ¿Los componentes (crear, borrar) emiten eventos?

---

## 8. Comparativa Visual: Presupuesto vs VentaTpv

| Aspecto | Presupuesto | VentaTpv |
|---------|-------------|----------|
| Estados Maestro | INICIAL, CREANDO_PRESUPUESTO | INICIAL (simple) |
| Estados Detalle | INICIAL, ABIERTO, APROBADO | 13+ estados |
| Contexto Detalle | Solo presupuesto | venta + lineas + pagos |
| Operaciones | Crear, Editar, Borrar, Aprobar | Crear, Editar, Pagar (3 formas), Devolver |
| Sub-modales | AprobarPresupuesto, BorrarPresupuesto | Barra Pagar (3 opciones), Devoluciones |
| Complejidad | Media | Alta |

---

## Conclusión

La plantilla es **correcta y seguible**, pero algo **simplificada**. VentaTpv es un mejor ejemplo de un módulo realista con:

- Múltiples estados
- Contextos complejos
- Manejo de errores
- Eventos bidireccionales (maestro ↔ detalle)

Ambas siguen la misma **filosofía core**:
1. **Separación de capas**
2. **Máquinas de estado explícitas**
3. **Eventos semánticos**
4. **Componentes sin lógica** (todo en máquinas y dominio)
