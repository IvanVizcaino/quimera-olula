import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroArticulo, EstadoMaestroArticulo } from "./diseño.ts";
import { Articulos, recargarArticulos } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroArticulo, ContextoMaestroArticulo> = () => ({
    INICIAL: {
        articulo_seleccionado: [Articulos.activar],
        articulo_deseleccionado: Articulos.desactivar,
        recarga_de_articulos_solicitada: recargarArticulos,
        criteria_cambiado: [Articulos.filtrar, recargarArticulos],
    },
});
