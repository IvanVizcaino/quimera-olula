import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro, filtroNumeros } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { DetalleStock } from "../detalle/DetalleStock.tsx";
import { Stock } from "../diseño.ts";
import { metaTablaStock } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";

export const MaestroConDetalleStock = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        stocks: listaActivaEntidadesInicial<Stock>(id, criteria),
    });

    useUrlParams(ctx.stocks.activo, ctx.stocks.criteria);

    useEffect(() => {
        emitir("recarga_de_stocks_solicitada", ctx.stocks.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Stock">
            <MaestroDetalle<Stock>
                Maestro={
                    <>
                        <h2>Stock</h2>
                        <Listado<Stock>
                            metaTabla={metaTablaStock}
                            metaFiltro={metaFiltro}
                            criteria={ctx.stocks.criteria}
                            entidades={ctx.stocks.lista}
                            totalEntidades={ctx.stocks.total}
                            seleccionada={ctx.stocks.activo}
                            onSeleccion={(payload) => emitir("stock_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleStock id={ctx.stocks.activo} publicar={emitir} />}
                seleccionada={ctx.stocks.activo}
                modoDisposicion="maestro-50"
            />
        </div>
    );
};

const metaFiltro: MetaFiltro = {
    // ...getMetaFiltroDefecto(metaTablaStock),
    articulo: {
        id: "articulo",
        campo: "articulo_id",
        label: "Artículo",
        filtro: (v) => (v ? ["articulo_id", "=", v as string] : null),
        render: (valor, onChange) => (
            <Articulo
                valor={(valor as string) ?? ""}
                onChange={(opcion) => onChange(opcion?.valor ?? "")}
            />
        ),
    },
    almacen: {
        id: "almacen",
        campo: "almacen_id",
        label: "Almacén",
        filtro: (v) => (v ? ["almacen_id", "=", v as string] : null),
        render: (valor, onChange) => (
        <Almacen
            nombre="almacen_id"
            valor={(valor as string) ?? ""}
            onChange={(opcion) => onChange(opcion?.valor ?? "")}
        />
        ),
    },
    fisica: {
        id: "fisica",
        label: "Cantidad física",
        tipo: "intervalo_numeros",
        filtro: (valor) => filtroNumeros("cantidad", valor),
    },
    disponible: {
        id: "disponible",
        label: "Disponible",
        tipo: "intervalo_numeros",
        filtro: (valor) => filtroNumeros("disponible", valor),
    }
}