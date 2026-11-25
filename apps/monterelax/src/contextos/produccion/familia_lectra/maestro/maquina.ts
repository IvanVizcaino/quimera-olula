import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroFamiliasLectra, EstadoMaestroFamiliasLectra } from "./diseño.ts";
import { actualizarFamiliasLectra, marcarFamiliaLectraPorDefecto, recargarFamiliasLectra } from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroFamiliasLectra, ContextoMaestroFamiliasLectra> = () => {
    return {
        INICIAL: {
            recarga_de_familias_solicitada: recargarFamiliasLectra,

            actualizacion_de_familias_solicitada: [actualizarFamiliasLectra, recargarFamiliasLectra],

            familia_marcada_por_defecto: [marcarFamiliaLectraPorDefecto, recargarFamiliasLectra],
        },
    }
}
