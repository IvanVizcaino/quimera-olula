import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { MetaTabla } from "@olula/componentes/index.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { Entidad } from "@olula/lib/diseño.ts";
import { puede } from "@olula/lib/dominio.ts";
import { useContext, useEffect, useState } from "react";
import { OpcionMaestro } from "../../comun/componentes/SelectorMaestro.tsx";
import { criteriaTodos } from "../../comun/dominio.ts";
import { getSecciones } from "../../seccion/infraestructura.ts";
import { SeccionTrabajador, Trabajador } from "../diseño.ts";
import { seccionesSinAsignar } from "../dominio.ts";
import { deleteSeccionTrabajador, patchSeccionPrincipal, postSeccionTrabajador } from "../infraestructura.ts";

type FilaSeccion = SeccionTrabajador & Entidad;

/**
 * Secciones en las que puede trabajar el trabajador (`pr_seccionestrab`): añadir, quitar y
 * marcar la principal. Para elegir una sección nueva hace falta leer las secciones
 * (`produccion.seccion`).
 */
export const SeccionesTrabajador = ({
    trabajador,
    recargar,
}: {
    trabajador: Trabajador;
    recargar: () => Promise<void>;
}) => {
    const { intentar } = useContext(ContextoError);
    const [opciones, setOpciones] = useState<OpcionMaestro[]>([]);
    const [nueva, setNueva] = useState("");

    useEffect(() => {
        if (!puede("produccion.seccion")) return;
        getSecciones(criteriaTodos).then(({ datos }) =>
            setOpciones(datos.map((s) => ({ valor: s.id, descripcion: `${s.id} - ${s.descripcion}` }))));
    }, []);

    const accion = (fn: () => Promise<void>) => async () => {
        await intentar(fn);
        await recargar();
    };

    const anadir = accion(async () => {
        await postSeccionTrabajador(trabajador.id, nueva, trabajador.secciones.length === 0);
        setNueva("");
    });

    const metaTabla: MetaTabla<FilaSeccion> = [
        { id: "seccionId", cabecera: "Sección", estilo: "secundario" },
        { id: "descripcion", cabecera: "Descripción" },
        { id: "principal", cabecera: "Principal", render: (s) => (s.principal ? "Sí" : "") },
        {
            id: "acciones",
            cabecera: "",
            render: (s) => (
                <div className="maestro-botones">
                    {!s.principal && (
                        <QBoton variante="texto" tamaño="pequeño"
                            onClick={accion(() => patchSeccionPrincipal(trabajador.id, s.seccionId))}>
                            Marcar principal
                        </QBoton>
                    )}
                    <QBoton variante="texto" tamaño="pequeño" destructivo
                        onClick={accion(() => deleteSeccionTrabajador(trabajador.id, s.seccionId))}>
                        Quitar
                    </QBoton>
                </div>
            ),
        },
    ];

    const disponibles = seccionesSinAsignar(opciones, trabajador.secciones);

    return (
        <div className="SeccionesTrabajador">
            <h3>Secciones</h3>
            {disponibles.length > 0 && (
                <div className="anadir-seccion">
                    <QSelect
                        label="Añadir sección"
                        nombre="nuevaSeccion"
                        opcional
                        valor={nueva}
                        opciones={disponibles}
                        onChange={(opcion) => setNueva(opcion?.valor ?? "")}
                    />
                    <QBoton onClick={anadir} deshabilitado={!nueva}>Añadir</QBoton>
                </div>
            )}
            <QTabla<FilaSeccion>
                metaTabla={metaTabla}
                datos={trabajador.secciones.map((s) => ({ ...s, id: s.seccionId }))}
                cargando={false}
                orden={[]}
            />
        </div>
    );
};
