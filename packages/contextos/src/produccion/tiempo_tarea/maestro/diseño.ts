import { MetaTabla } from "@olula/componentes/index.js";
import { TiempoTarea } from "../diseño.ts";
import { articuloDelTiempo, tareaDelTiempo } from "../dominio.ts";

// Los id de columna son los campos de la API: con ellos se ordena y se filtra. Tiempos en minutos.
export const metaTablaTiempos: MetaTabla<TiempoTarea> = [
    { id: "tipo_centro_id", cabecera: "Tipo de centro", ancho: "18%", render: (t) => t.tipoCentro || t.tipoCentroId },
    { id: "codigo_tarea", cabecera: "Tarea", ancho: "34%", estilo: "destacado", render: tareaDelTiempo },
    { id: "articulo_id", cabecera: "Artículo", ancho: "24%", render: articuloDelTiempo },
    { id: "coste_inicial", cabecera: "Inicial", ancho: "12%", tipo: "numero", render: (t) => String(t.costeInicial ?? "") },
    { id: "coste_unidad", cabecera: "Por unidad", ancho: "12%", tipo: "numero", render: (t) => String(t.costeUnidad ?? "") },
];
