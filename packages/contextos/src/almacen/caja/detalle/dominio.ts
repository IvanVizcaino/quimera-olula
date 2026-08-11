import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { Caja, CajaContenido, ComponenteCaja, MaterialCaja } from "../diseño.ts";
import { getCaja, patchCaja } from "../infraestructura.ts";
import { ContextoCaja, EstadoCaja } from "./diseño.ts";

type ProcesarCaja = ProcesarContexto<EstadoCaja, ContextoCaja>;
const pipeCaja = ejecutarListaProcesos<EstadoCaja, ContextoCaja>;

export const metaCaja: MetaModelo<Caja> = {
    campos: {
        ubicacionId: {
            requerido: true,
            validacion: (m: Caja) => stringNoVacio(m.idUbicacion),
        },
    },
};

export const cajaContenidoVacia = (): CajaContenido => ({
    id: "",
    lpn: "",
    idUbicacion: "",
    ubicacion: "",
    contenido: [],
});

export const contextoDetalleCajaInicial: ContextoCaja = {
    estado: "INICIAL",
    caja: cajaContenidoVacia(),
};

export const esMaterial = (comp: ComponenteCaja): comp is MaterialCaja =>
    "sku" in comp;

export const esSubcaja = (comp: ComponenteCaja): comp is CajaContenido =>
    "contenido" in comp;

const cargarCaja = (idCaja: string): ProcesarCaja => async (contexto) => {
    const caja = await getCaja(idCaja);
    return pipeCaja(contexto, [
        async (ctx) => ({ ...ctx, caja }),
        "ABIERTO",
    ]);
};

export const cargarContexto: ProcesarCaja = async (contexto, payload) => {
    const idCaja = payload as string;
    if (idCaja) {
        return cargarCaja(idCaja)(contexto);
    }
    return { ...contexto, estado: "INICIAL", caja: cajaContenidoVacia() };
};

export const refrescarCaja: ProcesarCaja = async (contexto) => {
    const caja = await getCaja(contexto.caja.id);
    return [
        { ...contexto, caja },
        [["caja_cambiada", caja]],
    ];
};

export const guardarCaja = async (
    contexto: ContextoCaja,
    caja: Caja
): Promise<void> => {
    if (caja.ubicacionId !== contexto.caja.ubicacionId ||
        caja.contenedorId !== contexto.caja.contenedorId) {
        await patchCaja(caja.id, caja);
    }
};
