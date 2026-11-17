import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearPickingFijo } from "../crear/CrearPickingFijo.tsx";
import { DetallePickingFijo } from "../detalle/DetallePickingFijo.tsx";
import { PickingFijo } from "../diseño.ts";
import { getMaquina } from "./maquina.ts";

const metaTablaPickingFijo: MetaTabla<PickingFijo> = [
    { id: "articulo", cabecera: "Artículo", render: (p) => `${p.articuloId} - ${p.articulo}` },
    { id: "ubicacion", cabecera: "Ubicación" },
    { id: "minimo", cabecera: "Mínimo", tipo: "numero" },
    { id: "maximo", cabecera: "Máximo", tipo: "numero" },
    { id: "unidadReposicion", cabecera: "Unidad", tipo: "numero" },
    { id: "stock", cabecera: "Stock", tipo: "numero" },
];

export const MaestroConDetallePickingFijo = () => {
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        pickings: listaActivaEntidadesInicial<PickingFijo>(id, criteriaInicial),
    });

    const { estado, pickings } = ctx;

    useUrlParams(pickings.activo, pickings.criteria);

    useEffect(() => {
        emitir("recarga_de_pickings_solicitada", pickings.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="PickingFijo">
            <MaestroDetalle<PickingFijo>
                Maestro={
                    <>
                        <h2>Picking fijo</h2>
                        <Listado<PickingFijo>
                            metaTabla={metaTablaPickingFijo}
                            criteria={pickings.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaPickingFijo}
                            entidades={pickings.lista}
                            totalEntidades={pickings.total}
                            seleccionada={pickings.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_picking_fijo_solicitado")}>
                                        Nuevo picking fijo
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("picking_fijo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetallePickingFijo id={pickings.activo} publicar={emitir} />}
                seleccionada={pickings.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && <CrearPickingFijo publicar={emitir} />}
        </div>
    );
};

const TarjetaPickingFijo = (p: PickingFijo) => (
    <div className="tarjeta-picking-fijo" key={p.id}>
        <div>{p.articuloId} - {p.articulo}</div>
        <div>{p.ubicacion}</div>
        <div>Mín. {p.minimo} / Máx. {p.maximo} / Unidad {p.unidadReposicion}</div>
        <div>Stock {p.stock}</div>
    </div>
);
