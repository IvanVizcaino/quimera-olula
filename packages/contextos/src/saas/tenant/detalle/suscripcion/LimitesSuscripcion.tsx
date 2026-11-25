import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { formatearFechaString } from "@olula/lib/dominio.ts";
import { DerechoLimite, ExcepcionLimite } from "../../suscripcion/diseño.js";
import { textoLimite, textoUsoLimite } from "../../suscripcion/dominio.js";

const metaTablaLimites = (excepciones: ExcepcionLimite[]): MetaTabla<DerechoLimite> => [
    { id: "nombre", cabecera: "Límite", render: (l) => `${l.nombre} (${l.unidad})` },
    { id: "uso", cabecera: "Uso / valor", render: (l) => textoUsoLimite(l.uso, l.valor) },
    {
        id: "excepcion",
        cabecera: "",
        render: (l) => excepciones.some((e) => e.limiteId === l.id)
            ? <QEtiqueta variante="advertencia">Excepción</QEtiqueta>
            : "",
    },
];

const metaTablaExcepciones = (
    nombre: (id: string) => string, editable: boolean, publicar: EmitirEvento
): MetaTabla<ExcepcionLimite> => [
    { id: "limiteId", cabecera: "Límite", render: (e) => nombre(e.limiteId) },
    { id: "valor", cabecera: "Valor", render: (e) => textoLimite(e.valor) },
    { id: "motivo", cabecera: "Motivo" },
    { id: "hasta", cabecera: "Caduca", render: (e) => (e.hasta ? formatearFechaString(e.hasta) : "No caduca") },
    {
        id: "acciones",
        cabecera: "",
        render: (e) => (
            <>
                <QBoton tamaño="pequeño" variante="borde" deshabilitado={!editable}
                    onClick={() => publicar("editar_excepcion_solicitada", e)}>Editar</QBoton>
                <QBoton tamaño="pequeño" variante="borde" destructivo deshabilitado={!editable}
                    onClick={() => publicar("quitar_excepcion_solicitada", e)}>Quitar</QBoton>
            </>
        ),
    },
];

/** Límites efectivos (lo que vale cada uno ahora y cuánto se usa) y excepciones que mandan sobre el plan. */
export const LimitesSuscripcion = ({
    limites,
    excepciones,
    editable,
    publicar,
}: {
    limites: DerechoLimite[];
    excepciones: ExcepcionLimite[];
    editable: boolean;
    publicar: EmitirEvento;
}) => {
    const nombre = (id: string) => limites.find((l) => l.id === id)?.nombre ?? id;
    return (
        <div className="LimitesSuscripcion">
            <h4>Límites efectivos</h4>
            <QTabla<DerechoLimite>
                metaTabla={metaTablaLimites(excepciones)}
                datos={limites}
                totalEntidades={limites.length}
                cargando={false}
                orden={[]}
            />

            <h4>Excepciones</h4>
            <div className="maestro-botones">
                <QBoton variante="borde" deshabilitado={!editable || limites.length === 0}
                    onClick={() => publicar("alta_excepcion_solicitada", null)}>
                    Añadir excepción
                </QBoton>
            </div>
            {excepciones.length === 0
                ? <p>Sin excepciones.</p>
                : (
                    <QTabla<ExcepcionLimite>
                        metaTabla={metaTablaExcepciones(nombre, editable, publicar)}
                        datos={excepciones}
                        totalEntidades={excepciones.length}
                        cargando={false}
                        orden={[]}
                    />
                )}
        </div>
    );
};
