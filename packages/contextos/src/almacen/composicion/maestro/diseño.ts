import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Composicion } from "../diseño.ts";

export type EstadoMaestroComposicion = "INICIAL" | "CREANDO";

export type ContextoMaestroComposicion = {
    estado: EstadoMaestroComposicion;
    composiciones: ListaActivaEntidades<Composicion>;
};

export const metaTablaComposicion: MetaTabla<Composicion> = [
    { id: "id", cabecera: "Id." },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "hora", cabecera: "Hora", render: (c) => c.hora.slice(0, 5) },
    { id: "articulo_id", cabecera: "Artículo", render: (c) => c.articuloId },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "cantidad", cabecera: "Cantidad" },
    { id: "almacen_id", cabecera: "Almacén", render: (c) => c.almacenId },
    { id: "usuario_id", cabecera: "Responsable", render: (c) => c.usuarioId },
];
