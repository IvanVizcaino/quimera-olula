import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect } from "react";
import { Articulo as ArticuloSelect } from "#/ventas/comun/componentes/articulo.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { Articulo } from "./diseño.ts";
import { TarjetaArticulo } from "./TarjetaArticulo.tsx";
import { DetalleArticulo } from "./detalle/DetalleArticulo.tsx";
import { metaTablaArticulo } from "./maestro/diseño.ts";
import { getMaquina } from "./maestro/maquina.ts";

export const MaestroConDetalleArticulo = () => {
    const { id, criteria } = getUrlParams();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        articulos: listaActivaEntidadesInicial<Articulo>(id, criteria),
    });

    useUrlParams(ctx.articulos.activo, ctx.articulos.criteria);

    useEffect(() => {
        emitir("recarga_de_articulos_solicitada", ctx.articulos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Articulo">
            <MaestroDetalle<Articulo>
                Maestro={
                    <>
                        <h2>Artículos</h2>
                        <Listado<Articulo>
                            metaTabla={metaTablaArticulo}
                            tarjeta={TarjetaArticulo}
                            metaFiltro={metaFiltro}
                            criteria={ctx.articulos.criteria}                            entidades={ctx.articulos.lista}
                            totalEntidades={ctx.articulos.total}
                            seleccionada={ctx.articulos.activo}
                            onSeleccion={(payload) => emitir("articulo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                        />
                    </>
                }
                Detalle={<DetalleArticulo id={ctx.articulos.activo} publicar={emitir} />}
                seleccionada={ctx.articulos.activo}
                modoDisposicion="maestro-50"
            />
        </div>
    );
};

const metaFiltro: MetaFiltro = {
    articulo: {
        id: "articulo",
        campo: "id",
        label: "Artículo",
        filtro: (v) => (v ? ["id", "=", v as string] : null),
        render: (valor, onChange) => (
            <ArticuloSelect
                valor={(valor as string) ?? ""}
                onChange={(opcion) => onChange(opcion?.valor ?? "")}
            />
        ),
    },
    grupo_iva_producto: {
        id: "grupo_iva_producto",
        campo: "grupo_iva_producto_id",
        label: "Grupo IVA",
        filtro: (v) => (v ? ["grupo_iva_producto_id", "=", v as string] : null),
        render: (valor, onChange) => (
            <GrupoIvaProducto
                valor={(valor as string) ?? ""}
                onChange={(opcion) => onChange(opcion?.valor ?? "")}
            />
        ),
    },
};
