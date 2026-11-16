import { MetaTabla } from "@olula/componentes/index.js";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { recargarListaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { FamiliaLectra, TipoFamiliaLectra } from "../diseño.ts";
import { getFamiliasLectra, patchFamiliaLectraPorDefecto, postActualizarFamiliasLectra } from "../infraestructura.ts";
import { ContextoMaestroFamiliasLectra, EstadoMaestroFamiliasLectra } from "./diseño.ts";

export const metaTablaFamiliaLectra: MetaTabla<FamiliaLectra> = [
    { id: "referencia", cabecera: "Referencia" },
];

type ProcesarFamiliasLectra = ProcesarContexto<EstadoMaestroFamiliasLectra, ContextoMaestroFamiliasLectra>;

export const recargarFamiliasLectra: ProcesarFamiliasLectra = async (contexto) => {
    const [anidado, corte, suministro] = await Promise.all([
        getFamiliasLectra("anidado"),
        getFamiliasLectra("corte"),
        getFamiliasLectra("suministro"),
    ]);

    return {
        ...contexto,
        anidado: recargarListaEntidades(contexto.anidado, anidado),
        corte: recargarListaEntidades(contexto.corte, corte),
        suministro: recargarListaEntidades(contexto.suministro, suministro),
    };
};

export const actualizarFamiliasLectra: ProcesarFamiliasLectra = async (contexto) => {
    await postActualizarFamiliasLectra();
    return contexto;
};

export const marcarFamiliaLectraPorDefecto: ProcesarFamiliasLectra = async (contexto, payload) => {
    const { tipo, referencia } = payload as { tipo: TipoFamiliaLectra; referencia: string };
    await patchFamiliaLectraPorDefecto(tipo, referencia);
    return contexto;
};
