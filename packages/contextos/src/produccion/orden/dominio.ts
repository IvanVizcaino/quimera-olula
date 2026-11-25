import { EstadoEtiqueta } from "#/comun/diseño.ts";
import { ClausulaFiltro, Filtro } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { AccionesCicloVida, cabeAccion } from "../comun/ciclo_vida.ts";
import { fechaApi, primerError, sinTexto, sumarDias } from "../comun/dominio.ts";
import {
    CambiosLoteOrden,
    CambiosOrden,
    EstadoOrden,
    FormLoteOrden,
    LoteOrden,
    NuevaOrden,
    OrdenProduccion,
} from "./diseño.ts";

/** Agregado del ciclo de vida y sus comandos (`comandos/produccion/orden/ciclo_vida.yaml`). */
export const AGREGADO_ORDEN = "produccion.orden";
export const COMANDO = {
    cambiar: "produccion.orden.cambiar",
    borrar: "produccion.orden.borrar",
    anadirLote: "produccion.orden.anadir_lote",
    cambiarLote: "produccion.orden.cambiar_lote",
    quitarLote: "produccion.orden.quitar_lote",
    lanzar: "produccion.orden.lanzar",
    terminar: "produccion.orden.terminar",
    sacarProceso: "produccion.orden.sacar_proceso",
} as const;

/** Campos de la cabecera que se cambian en cualquier estado (`salvo_si_solo_cambia`). */
export const CAMPOS_SIEMPRE_EDITABLES = ["descripcion", "observaciones", "fechaEntrega"] as const;

export const ESTADOS_ORDEN: { valor: EstadoOrden; descripcion: string }[] = [
    { valor: "PTE", descripcion: "Pendiente" },
    { valor: "EN CURSO", descripcion: "En curso" },
    { valor: "TERMINADA", descripcion: "Terminada" },
];

const etiquetasEstado: Record<EstadoOrden, EstadoEtiqueta> = {
    PTE: { texto: "Pendiente", tono: "pendiente" },
    "EN CURSO": { texto: "En curso", tono: "parcial" },
    TERMINADA: { texto: "Terminada", tono: "completado" },
};

/** Píldora del estado de la orden (o de un lote, que usa los mismos estados). */
export const etiquetaEstadoOrden = (estado: string | null | undefined): EstadoEtiqueta =>
    etiquetasEstado[(estado ?? "") as EstadoOrden] ?? { texto: estado || "—", tono: "borrador" };

/** Indicador «Lanzada»: la orden tiene proceso y aún no ha empezado (sigue PTE). */
export const etiquetaLanzada = (orden: Pick<OrdenProduccion, "estado" | "lanzada">): EstadoEtiqueta | null =>
    orden.lanzada && orden.estado === "PTE" ? { texto: "Lanzada", tono: "parcial" } : null;

/**
 * Qué acciones del motor caben en la orden: por el ciclo de vida o, sin él, por su estado
 * (lanzar solo PTE sin lanzar; sacar el proceso solo lanzada sin empezar; terminar lanzada o EN CURSO).
 */
export const accionesMotorOrden = (
    orden: Pick<OrdenProduccion, "estado" | "lanzada">,
    acciones: AccionesCicloVida | null,
): { lanzar: boolean; terminar: boolean; sacarProceso: boolean } => {
    const lanzadaSinEmpezar = orden.lanzada && orden.estado === "PTE";
    return {
        lanzar: cabeAccion(acciones, COMANDO.lanzar, orden.estado === "PTE" && !orden.lanzada),
        terminar: cabeAccion(acciones, COMANDO.terminar, lanzadaSinEmpezar || orden.estado === "EN CURSO"),
        sacarProceso: cabeAccion(acciones, COMANDO.sacarProceso, lanzadaSinEmpezar),
    };
};

/** Cantidad en formato español con hasta 3 decimales: 1234.5 → "1234,5", 12345.678 → "12.345,678". */
export const formatearCantidad = (valor: number | string | null | undefined): string => {
    if (valor === null || valor === undefined || valor === "") return "";
    const numero = Number(valor);
    if (Number.isNaN(numero)) return String(valor);
    return numero.toLocaleString("es-ES", { maximumFractionDigits: 3 });
};

/** Cantidad del formulario (acepta coma decimal) en número; `null` si está vacía o no es un número. */
export const cantidadDesdeTexto = (valor: number | string | null | undefined): number | null => {
    if (valor === null || valor === undefined) return null;
    if (typeof valor === "number") return Number.isNaN(valor) ? null : valor;
    const texto = valor.trim();
    if (texto === "") return null;
    // "1.234,5" (miles con punto y coma decimal) o "1234,5" o "1234.5".
    const normalizado = texto.includes(",") ? texto.replace(/\./g, "").replace(",", ".") : texto;
    const numero = Number(normalizado);
    return Number.isNaN(numero) ? null : numero;
};

const motivoCantidadNoValida = (valor: number | string | null | undefined): string | null => {
    if (valor === null || valor === undefined || String(valor).trim() === "") return "La cantidad es obligatoria";
    const numero = cantidadDesdeTexto(valor);
    if (numero === null) return "La cantidad ha de ser un número";
    if (numero <= 0) return "La cantidad ha de ser mayor que cero";
    if (Math.abs(Math.round(numero * 1000) - numero * 1000) > 1e-6)
        return "La cantidad admite como máximo 3 decimales";
    return null;
};

/** Que la entrega no sea anterior a la fecha de la orden (lo exige el servidor). */
export const motivoEntregaNoValida = (fecha: string | null | undefined, entrega: string | null | undefined): string | null =>
    !sinTexto(fecha) && !sinTexto(entrega) && (entrega as string) < (fecha as string)
        ? "La fecha de entrega no puede ser anterior a la fecha de la orden"
        : null;

export const validarNuevaOrden = (o: NuevaOrden): string | true =>
    primerError(
        sinTexto(o.fecha) ? "La fecha es obligatoria" : null,
        motivoEntregaNoValida(o.fecha, o.fechaEntrega),
        sinTexto(o.articuloId) ? "El artículo es obligatorio" : null,
        motivoCantidadNoValida(o.cantidad),
    );

export const validarOrden = (o: Pick<OrdenProduccion, "fecha" | "fechaEntrega">): string | true =>
    primerError(
        sinTexto(o.fecha) ? "La fecha es obligatoria" : null,
        motivoEntregaNoValida(o.fecha, o.fechaEntrega),
    );

export const validarFormLote = (l: FormLoteOrden): string | true =>
    primerError(
        sinTexto(l.articuloId) ? "El artículo es obligatorio" : null,
        motivoCantidadNoValida(l.cantidad),
    );

/** Alta vacía: fecha de hoy. Función, porque la fecha cambia (el formulario la llama una vez). */
export const nuevaOrdenVacia = (hoy: Date = new Date()): NuevaOrden => ({
    fecha: fechaApi(hoy), fechaEntrega: "", descripcion: "", articuloId: "", cantidad: null, fechaFabricacion: "",
});

/** Fecha de fabricación que pondrá el servidor si no se indica (hoy + 20 días, `DIAS_FABRICACION`). */
export const fechaFabricacionPorDefecto = (hoy: Date = new Date()): string => sumarDias(fechaApi(hoy), 20);

export const ordenVacia = (): OrdenProduccion => ({
    id: "", fecha: "", fechaEntrega: "", estado: "PTE", lanzada: false, descripcion: "", observaciones: "", pedidoId: "",
    clienteId: "", cliente: "", totalLotes: 0, totalUds: 0, lotes: [], tareas: [],
});

/** Validación de la entrega en su campo (para que el formulario diga por qué no se guarda). */
const validacionEntrega = (o: { fecha: string; fechaEntrega: string }): string | true =>
    motivoEntregaNoValida(o.fecha, o.fechaEntrega) ?? true;

export const metaNuevaOrden: MetaModelo<NuevaOrden> = {
    campos: {
        fecha: { requerido: true },
        fechaEntrega: { requerido: false, validacion: validacionEntrega },
        descripcion: { requerido: false },
        articuloId: { requerido: true },
        cantidad: { requerido: true, validacion: (o) => motivoCantidadNoValida(o.cantidad) ?? true },
        fechaFabricacion: { requerido: false },
    },
    validacion: validarNuevaOrden,
};

export const metaFormLote: MetaModelo<FormLoteOrden> = {
    campos: {
        articuloId: { requerido: true },
        cantidad: { requerido: true, validacion: (l) => motivoCantidadNoValida(l.cantidad) ?? true },
        fechaFabricacion: { requerido: false },
    },
    validacion: validarFormLote,
};

/**
 * Meta de la cabecera: todo editable si cabe `cambiar` (PTE); si no, solo los campos que el
 * ciclo de vida deja cambiar en cualquier estado. Sin acciones aún, se decide por el estado.
 */
export const metaOrden = (acciones: AccionesCicloVida | null): MetaModelo<OrdenProduccion> => ({
    campos: {
        fecha: { requerido: true },
        fechaEntrega: { requerido: false, validacion: validacionEntrega },
        descripcion: { requerido: false },
        observaciones: { requerido: false },
        pedidoId: { requerido: false },
        clienteId: { requerido: false },
    },
    editable: (orden, campo) => campoOrdenEditable(orden, acciones, campo),
    validacion: validarOrden,
});

export const campoOrdenEditable = (
    orden: Pick<OrdenProduccion, "estado">,
    acciones: AccionesCicloVida | null,
    campo?: string,
): boolean => {
    if (campo === undefined) return true;
    if (cabeAccion(acciones, COMANDO.cambiar, orden.estado === "PTE")) return true;
    return (CAMPOS_SIEMPRE_EDITABLES as readonly string[]).includes(campo);
};

const CAMPOS_CABECERA = ["fecha", "fechaEntrega", "descripcion", "observaciones", "pedidoId", "clienteId"] as const;

const texto = (valor: unknown): string => (valor === null || valor === undefined ? "" : String(valor).trim());

/** Solo los campos de la cabecera que cambian de `antes` a `despues` (vacío y `null` son lo mismo). */
export const cambiosOrden = (antes: OrdenProduccion, despues: OrdenProduccion): CambiosOrden => {
    const cambios: CambiosOrden = {};
    for (const campo of CAMPOS_CABECERA) {
        if (texto(antes[campo]) !== texto(despues[campo])) cambios[campo] = texto(despues[campo]);
    }
    return cambios;
};

/** Cambios del lote desde el formulario (solo lo que cambia). */
export const cambiosLote = (lote: LoteOrden, form: FormLoteOrden): CambiosLoteOrden => {
    const cambios: CambiosLoteOrden = {};
    const cantidad = cantidadDesdeTexto(form.cantidad);
    if (cantidad !== null && cantidad !== lote.cantidad) cambios.cantidad = cantidad;
    if (texto(form.fechaFabricacion) !== texto(lote.fechaFabricacion))
        cambios.fechaFabricacion = texto(form.fechaFabricacion);
    return cambios;
};

/** Cantidad para editarla: coma decimal y sin separador de miles ("12,5"), que `cantidadDesdeTexto` relee. */
export const cantidadParaEditar = (valor: number): string => String(valor).replace(".", ",");

export const formDesdeLote = (lote: LoteOrden): FormLoteOrden => ({
    articuloId: lote.articuloId, cantidad: cantidadParaEditar(lote.cantidad), fechaFabricacion: lote.fechaFabricacion,
});

export const nuevoLoteVacio = (): FormLoteOrden => ({ articuloId: "", cantidad: null, fechaFabricacion: "" });

/**
 * Una orden, un lote: «Añadir lote» solo si la orden no tiene ninguno y cabe en su estado. Las
 * órdenes antiguas con varios lotes se muestran en una lista de solo lectura.
 */
export const puedeAnadirLote = (
    orden: Pick<OrdenProduccion, "lotes" | "estado" | "lanzada">,
    acciones: AccionesCicloVida | null,
): boolean =>
    orden.lotes.length === 0 && cabeAccion(acciones, COMANDO.anadirLote, orden.estado === "PTE" && !orden.lanzada);

/** El lote de la orden si tiene exactamente uno (se muestra como bloque de datos editable). */
export const loteUnico = (orden: Pick<OrdenProduccion, "lotes">): LoteOrden | null =>
    orden.lotes.length === 1 ? orden.lotes[0] : null;

/** Título del detalle: "OP00000001 · descripción" (o el artículo del lote si no hay descripción). */
export const tituloOrden = (orden: OrdenProduccion): string => {
    const nombre = orden.descripcion || orden.lotes[0]?.descripcion || orden.lotes[0]?.articuloId || "";
    return nombre ? `${orden.id} · ${nombre}` : orden.id;
};

/** Filtro de pedidos por código (y del cliente, si se indica); con `codigo`, ese pedido. */
export const filtroPedidosCliente = (texto: string, clienteId?: string, codigo?: string): Filtro => {
    if (codigo) return [["codigo", "=", codigo]];
    const filtro: ClausulaFiltro[] = [["codigo", "~", texto]];
    if (clienteId) filtro.push(["cliente_id", "=", clienteId]);
    return filtro;
};

/** Nombre del PDF de la hoja de orden (el mismo que da el servidor). */
export const nombreHojaOrden = (id: string, hasta?: string): string => {
    const desde = id.trim();
    const fin = hasta?.trim();
    return fin && fin !== desde ? `ordenes-${desde}-${fin}.pdf` : `orden-${desde}.pdf`;
};

/** Rango de la impresión de hojas: «desde» obligatorio y «hasta» (opcional) no anterior. */
export const motivoRangoHojasNoValido = (desde: string, hasta: string): string | null => {
    const d = desde.trim();
    const h = hasta.trim();
    if (!d) return "Indique la orden desde la que imprimir";
    if (h && h < d) return "La orden «hasta» no puede ser anterior a la orden «desde»";
    return null;
};
