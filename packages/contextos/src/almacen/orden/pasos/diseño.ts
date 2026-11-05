// Modelo general de pasos de lectura de una orden de almacén.
//
// Cada código de `pasosPick` / `pasosDrop` (p. ej. "SKU-CANTIDAD") se traduce,
// mediante el catálogo, a una DefinicionPasos que describe qué tiene que
// verificar el operario en cada dimensión de la lectura. El mismo catálogo
// existe en el backend: olula_servidor/comandos/almacen/orden/pasos.py.

export type FaseLectura = "PICK" | "DROP";

/**
 * De dónde sale la mercancía (solo pick).
 * UBI_O_CAJA: se lee una caja, o el artículo suelto de la ubicación de la línea.
 * LINEA: no se lee, se toma de la línea.
 */
export type ModoOrigen = "UBI" | "CAJA" | "UBI_O_CAJA" | "LINEA";

/** Qué mercancía se mueve. CAJA = caja monoproducto (aporta SKU y lote) o palé. */
export type ModoQue = "SKU" | "LOTE" | "SKU_O_LOTE" | "CAJA" | "LINEA";

/** Cómo se obtiene la cantidad. */
export type ModoCantidad =
    | "LEER" // la teclea el operario (precargada con lo pendiente)
    | "PENDIENTE" // lo pendiente de la línea (limitado al stock suelto si se coge suelto)
    | "CONTENIDO_CAJA" // lo que contiene la caja leída
    | "CAPACIDAD_CAJA_DESTINO" // la capacidad de la caja destino leída
    | "CAPACIDAD_SUBCAJA"; // la capacidad de la subcaja del palé (la calcula el backend)

/** Dónde se deja la mercancía. UBI = suelta en la ubicación. */
export type ModoDestino = "NINGUNO" | "CAJA_ETIQUETA" | "UBI" | "CAJA" | "UBI_O_CAJA" | "LINEA";

/** Si se lee una caja origen: sacar material de ella o mover la caja entera. */
export type ManejoCaja = "EXTRAER" | "COMPLETA";

/**
 * Lecturas en serie (en cabecera):
 * QUE: se leen varias cajas y después un único destino para todas.
 * DESTINO: tras leer el qué, cada destino leído registra una lectura (cajas etiqueta).
 */
export type ModoSerie = "QUE" | "DESTINO";

export interface DefinicionPasos {
    codigo: string;
    fase: FaseLectura;
    /** Nombre corto para los selectores. */
    nombre: string;
    instruccion: string;
    origen: ModoOrigen | null;
    que: ModoQue;
    cantidad: ModoCantidad;
    destino: ModoDestino;
    manejoCaja: ManejoCaja | null;
    /** La lectura no tiene fase: mueve de origen a destino en un solo paso. */
    directo: boolean;
    serie: ModoSerie | null;
    /** Se admite leer un palé (caja sin SKU) y registrar todo su contenido. */
    palet: boolean;
}

/** Dimensiones que el operario tiene que completar, en orden. */
export type DimensionLectura = "origen" | "que" | "cantidad" | "destino";

export type CodigoResuelto =
    | { tipo: "articulo"; sku: string; descripcion: string; loteId: string | null }
    | {
          tipo: "caja";
          id: string;
          lpn: string;
          sku: string | null;
          idLote: string | null;
          idUbicacion: string | null;
          cantidad: number | null;
          capacidad: number | null;
      }
    | { tipo: "ubicacion"; id: string; codigo: string };

export type TipoCodigo = CodigoResuelto["tipo"];
export type CajaResuelta = Extract<CodigoResuelto, { tipo: "caja" }>;

/** Datos consultados al backend antes de aplicar un código (pick con UBI_O_CAJA). */
export interface ContextoLectura {
    /** Lotes del artículo de la línea dentro de la caja leída. */
    lotesEnCaja?: string[];
    /** Stock suelto (fuera de cajas) del artículo/lote en la ubicación origen. */
    stockSuelto?: number;
}

export interface ValoresLectura {
    idUbicacionOrigen?: string | null;
    ubicacionOrigen?: string | null;
    /** null = material suelto (sin caja). */
    idCajaOrigen?: string | null;
    cajaOrigen?: string | null;
    sku?: string;
    articulo?: string;
    loteId?: string | null;
    /** Lotes entre los que debe elegir el operario (caja con varios lotes). */
    lotesParaElegir?: string[];
    cantidad?: number;
    /** Tope de cantidad (stock suelto disponible). */
    cantidadMaxima?: number;
    /** Contenido o capacidad de la caja leída, según el modo de cantidad. */
    cantidadCaja?: number | null;
    idUbicacionDestino?: string | null;
    ubicacionDestino?: string | null;
    idCajaDestino?: string | null;
    cajaDestino?: string | null;
    /** Palé leído: se registra con una lectura de caja completa. */
    palet?: { id: string; lpn: string };
}

export type ResultadoAplicar =
    | { ok: true; valores: ValoresLectura }
    | { ok: false; error: string };
