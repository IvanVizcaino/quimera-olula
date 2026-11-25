import { MetaTabla } from "@olula/componentes/index.js";
import { siONada } from "../../comun/dominio.ts";
import { DetalleSimple } from "../../comun/maestro_simple/DetalleSimple.tsx";
import { MaestroSimple } from "../../comun/maestro_simple/MaestroSimple.tsx";
import { CamposFabricacion } from "../detalle/CamposFabricacion.tsx";
import { FabricacionArticulo } from "../diseño.ts";
import { fabricacionVacia, metaFabricacion } from "../dominio.ts";
import { getFabricacionArticulo, getFabricacionArticulos, patchFabricacionArticulo } from "../infraestructura.ts";

// Los id de columna son los campos de la API: con ellos se ordena y se filtra.
const metaTabla: MetaTabla<FabricacionArticulo> = [
    { id: "id", cabecera: "Artículo", estilo: "secundario", ancho: "20%" },
    { id: "descripcion", cabecera: "Descripción", estilo: "destacado" },
    { id: "fabricado", cabecera: "Fabricado", ancho: "12%", render: (a) => siONada(a.fabricado) },
    { id: "tipo_proceso_id", cabecera: "Tipo de proceso", render: (a) => a.tipoProceso || a.tipoProcesoId },
    { id: "por_lotes", cabecera: "Por lotes", ancho: "12%", render: (a) => siONada(a.porLotes) },
];

const consultas = { getUno: getFabricacionArticulo, getLista: getFabricacionArticulos };

const guardar = (a: FabricacionArticulo) =>
    patchFabricacionArticulo(a.id, { fabricado: a.fabricado, tipoProcesoId: a.tipoProcesoId });

/**
 * Producción > Fabricación de artículos: si cada artículo se fabrica, con qué tipo de proceso y en
 * qué tarea se consume cada componente. Los artículos y sus componentes se crean en almacén.
 */
export const MaestroFabricacionArticulo = () => (
    <MaestroSimple<FabricacionArticulo>
        clase="MaestroFabricacionArticulo"
        titulo="Fabricación de artículos"
        metaTabla={metaTabla}
        consultas={consultas}
        tarjeta={(a) => (
            <div key={a.id}>
                <div>{a.id} - {a.descripcion}</div>
                <div>{siONada(a.fabricado) ? `Fabricado · ${a.tipoProceso || a.tipoProcesoId}` : ""}</div>
            </div>
        )}
        detalle={(id, publicar) => (
            <DetalleSimple<FabricacionArticulo>
                id={id}
                publicar={publicar}
                clase="DetalleFabricacionArticulo"
                getUno={getFabricacionArticulo}
                guardar={guardar}
                vacia={fabricacionVacia}
                meta={metaFabricacion}
                titulo={(a) => `${a.id} - ${a.descripcion}`}
                campos={({ modelo, entidad, recargar }) => (
                    <CamposFabricacion modelo={modelo} entidad={entidad} recargar={recargar} />
                )}
            />
        )}
    />
);
