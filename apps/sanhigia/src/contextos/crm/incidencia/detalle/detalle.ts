import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { pipe } from "@olula/lib/funcional.js";
import { Incidencia } from "../diseño.ts";
import { getIncidencia, patchIncidencia } from "../infraestructura.ts";
import { ContextoDetalleIncidencia, EstadoDetalleIncidencia } from "./diseño.ts";

export const incidenciaVacia: Incidencia = {
    id: "",
    descripcion: "",
    observaciones: "",
    nombreCliente: "",
    nombreCausante: "",
    prioridad: "Media",
    fecha: new Date(),
    estado: "Nueva",
    clienteId: "",
    tipoIncidencia: "Transportista",
    categoriaIncidencia: "INCIDT",
    subCategoriaIncidencia: "",
    facturaId: "",
    codigoFactura: "",
    articuloId: "",
    agenteId: "",
};

export const metaIncidencia: MetaModelo<Incidencia> = {
    campos: {
        descripcion: { requerido: true, validacion: (incidencia: Incidencia) => stringNoVacio(incidencia.descripcion) },
        clienteId: { requerido: true, validacion: (incidencia: Incidencia) => stringNoVacio(incidencia.clienteId) },
        facturaId: { requerido: true, validacion: (incidencia: Incidencia) => stringNoVacio(incidencia.facturaId ?? "") },
        observaciones: { requerido: true, validacion: (incidencia: Incidencia) => stringNoVacio(incidencia.observaciones) },
        nombreCliente: { requerido: true, validacion: (incidencia: Incidencia) => stringNoVacio(incidencia.nombreCliente) },
        prioridad: { requerido: true },
        fecha: { requerido: true, tipo: "fecha" },
        estado: { requerido: true, tipo: "selector" },
        tipoIncidencia: { requerido: true, tipo: "selector" },
        articuloId: {
            requerido: false,
            validacion: (incidencia: Incidencia) =>
                incidencia.tipoIncidencia === "Proveedor"
                    ? stringNoVacio(incidencia.articuloId ?? "")
                    : true
        },
        categoriaIncidencia: { requerido: true, validacion: (incidencia: Incidencia) => stringNoVacio(incidencia.categoriaIncidencia) },
    },
};

type ProcesarIncidencia = ProcesarContexto<EstadoDetalleIncidencia, ContextoDetalleIncidencia>;

const pipeIncidencia = ejecutarListaProcesos<EstadoDetalleIncidencia, ContextoDetalleIncidencia>;

const conIncidencia = (incidencia: Incidencia) => (ctx: ContextoDetalleIncidencia) => ({ ...ctx, incidencia });
const conEstado = (estado: EstadoDetalleIncidencia) => (ctx: ContextoDetalleIncidencia) => ({ ...ctx, estado });

const cargarIncidencia: (_: string) => ProcesarIncidencia = (id) =>
    async (contexto) => {
        const incidencia = await getIncidencia(id);

        return pipe(
            contexto,
            conIncidencia(incidencia)
        )
    }

export const refrescarIncidencia: ProcesarIncidencia = async (contexto) => {
    const incidencia = await getIncidencia(contexto.incidencia.id);

    return [
        pipe(
            contexto,
            conIncidencia({
                ...contexto.incidencia,
                ...incidencia
            })
        ),
        [["incidencia_cambiada", incidencia]]
    ]
}

export const cambiarIncidencia: ProcesarIncidencia = async (contexto, payload) => {
    const incidencia = payload as Incidencia;
    await patchIncidencia(contexto.incidencia.id, incidencia)

    return pipeIncidencia(contexto, [
        refrescarIncidencia,
        "INICIAL",
    ]);
}

export const getContextoVacio: ProcesarIncidencia = async (contexto) => {
    return pipe(
        contexto,
        conEstado("INICIAL"),
        conIncidencia(incidenciaVacia)
    )
}

export const cargarContexto: ProcesarIncidencia = async (contexto, payload) => {
    const id = payload as string;

    if (!id) return getContextoVacio(contexto);

    return pipeIncidencia(
        contexto,
        [cargarIncidencia(id)],
        payload
    );
}
