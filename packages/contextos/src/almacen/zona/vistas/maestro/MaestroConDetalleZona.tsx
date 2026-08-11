import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect, useMemo } from "react";
import { Zona } from "../../diseño.ts";
import { CrearZona } from "../crear/CrearZona.js";
import { DetalleZona } from "../detalle/DetalleZona.js";
import { getMaquina } from "./maquina.js";

const metaTablaZona: MetaTabla<Zona> = [
    { id: "codigo", cabecera: "Código" },
    { id: "almacenId", cabecera: "Almacén" },
    { id: "descripcion", cabecera: "Descripción" },
];

export const MaestroConDetalleZona = () => {
    const criteriaBase = useMemo(() => criteriaDefecto, []);
    const { layout, cambiarLayout } = useLayout("TARJETA");

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        zonas: listaActivaEntidadesInicial<Zona>(id, criteriaInicial),
    });

    const { estado, zonas } = ctx;

    useUrlParams(zonas.activo, zonas.criteria);

    useEffect(() => {
        emitir("recarga_de_zonas_solicitada", zonas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Zona">
            <MaestroDetalle<Zona>
                Maestro={
                    <>
                        <h2>Zonas</h2>
                        <div className="maestro-botones">
                            <span
                                className="cambio-modo-icono"
                                onClick={cambiarLayout}
                            >
                                <QIcono
                                    nombre={layout === "TABLA" ? "lista" : "tabla"}
                                    tamaño="md"
                                />
                            </span>
                        </div>
                        <Listado<Zona>
                            metaTabla={metaTablaZona}
                            criteria={zonas.criteria}
                            modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
                            tarjeta={TarjetaZona}
                            entidades={zonas.lista}
                            totalEntidades={zonas.total}
                            seleccionada={zonas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_zona_solicitado")}>
                                        Nueva Zona
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("zona_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleZona id={zonas.activo} publicar={emitir} />}
                layout={layout}
                seleccionada={zonas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearZona publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaZona = (zona: Zona) => (
    <div className="tarjeta-zona" key={zona.id}>
        <div className="tarjeta-zona-codigo">{zona.codigo}</div>
        <div className="tarjeta-zona-descripcion">{zona.descripcion}</div>
    </div>
);
