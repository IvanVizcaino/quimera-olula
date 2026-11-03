import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { ConexionBancaria, PrestamoBancario } from "../diseño.js";
import { conexionBancariaVacia } from "../dominio.js";
import {
    getConexionBancaria,
    getPrestamoBancario,
    getPrestamosBancarios,
    patchTiposProductoConexionBancaria,
} from "../infraestructura.js";
import { ContextoDetalleConexionBancaria, EstadoDetalleConexionBancaria } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleConexionBancaria, ContextoDetalleConexionBancaria>;

const pipeConexionBancaria = ejecutarListaProcesos<EstadoDetalleConexionBancaria, ContextoDetalleConexionBancaria>;

/**
 * Solo lectura: la conexión la gestiona el proveedor bancario (institución,
 * estado, cursor de sincronización...), aquí no hay nada que editar a mano
 * salvo la asociación de cuentas (ver detalle/cuentas/CuentasConexionBancaria.tsx).
 */
export const metaConexionBancaria: MetaModelo<ConexionBancaria> = {
    campos: {
        proveedor: { tipo: "texto" },
        institucionId: { tipo: "texto" },
        institucionNombre: { tipo: "texto" },
        estado: { tipo: "texto" },
        ultimaSincronizacion: { tipo: "fecha" },
        ultimoError: { tipo: "texto" },
        creadoEn: { tipo: "fecha" },
    },
    editable: () => false,
};

export const contextoDetalleConexionBancariaInicial: ContextoDetalleConexionBancaria = {
    estado: 'INICIAL',
    conexion: conexionBancariaVacia,
    prestamos: [],
    prestamoSeleccionado: null,
};

const cargarPrestamos = async (conexion: ConexionBancaria): Promise<PrestamoBancario[]> =>
    conexion.cuentas.some((cuenta) => cuenta.tipo === "loans")
        ? await getPrestamosBancarios(conexion.id)
        : [];

export const cargarConexionBancaria: (_: string) => ProcesarDetalle =
    (idConexion) => async (contexto) => {
        const conexion = await getConexionBancaria(idConexion);
        const prestamos = await cargarPrestamos(conexion);
        return pipeConexionBancaria(contexto, [
            async (ctx) => ({ ...ctx, conexion, prestamos, prestamoSeleccionado: null }),
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idConexion = payload as string;
    if (idConexion) {
        return cargarConexionBancaria(idConexion)(contexto);
    }
    return { ...contexto, estado: 'INICIAL', conexion: conexionBancariaVacia, prestamos: [] };
};

/**
 * Refresca la conexión completa (cabecera + cuentas) tras asociar/activar una
 * cuenta (ver detalle/cuentas/CuentasConexionBancaria.tsx). Propaga el cambio
 * al maestro para mantener la lista sincronizada.
 */
export const refrescarConexionBancaria: ProcesarDetalle = async (contexto) => {
    const conexion = await getConexionBancaria(contexto.conexion.id);
    const prestamos = await cargarPrestamos(conexion);
    return [
        { ...contexto, estado: 'ABIERTO', conexion, prestamos, prestamoSeleccionado: null },
        [["conexion_bancaria_cambiada", conexion]],
    ];
};

/** Los tipos de producto (accounts, loans) que se leen de la conexión. */
export const cambiarTiposProducto: ProcesarDetalle = async (contexto, payload) => {
    await patchTiposProductoConexionBancaria(contexto.conexion.id, payload as ConexionBancaria["tiposProducto"]);
    return refrescarConexionBancaria(contexto);
};

export const seleccionarPrestamo: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    prestamoSeleccionado: payload as PrestamoBancario,
});

/** Con sus cuotas, que la lista no trae. */
export const cargarCuotasPrestamo: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    prestamoSeleccionado: await getPrestamoBancario((payload as PrestamoBancario).id),
});
