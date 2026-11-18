import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, formatearMoneda, plugin } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { DetalleReciboCompra } from "../detalle/DetalleReciboCompra.js";
import { ReciboCompra } from "../diseño.js";
import { recibosSeleccionados } from "./maestro.js";
import "./MaestroConDetalleReciboCompra.css";
import { getMaquina } from "./maquina.js";
import { RemesarRecibosCompra } from "./RemesarRecibosCompra.js";

const metaTablaReciboCompra: MetaTabla<ReciboCompra> = [
    { id: 'codigo', cabecera: 'Código' },
    { id: 'nombreProveedor', cabecera: 'Proveedor' },
    { id: 'idFiscal', cabecera: 'ID Fiscal' },
    { id: 'fechaEmision', cabecera: 'F. Emisión', tipo: 'fecha' },
    { id: 'fechaVencimiento', cabecera: 'F. Vencimiento', tipo: 'fecha' },
    { id: 'estado', cabecera: 'Estado' },
    { id: 'importe', cabecera: 'Importe', tipo: 'moneda' },
];

export const MaestroConDetalleReciboCompra = () => {

    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const navigate = useNavigate();

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        recibos: listaActivaEntidadesInicial<ReciboCompra>(id, criteriaInicial),
        seleccionados: [],
        remesaCreada: null,
    });

    const { estado, recibos, seleccionados, remesaCreada } = ctx;

    // Las remesas de pago solo se ofrecen con su plugin activo.
    const remesasActivas = plugin("remesa_pago") === "activo";
    const [multiseleccion, setMultiseleccion] = useState(false);
    const elegidos = recibosSeleccionados(seleccionados, recibos.lista);

    useEffect(() => {
        if (remesaCreada) navigate(`/tesoreria/remesa_pago?id=${remesaCreada}`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remesaCreada]);

    useUrlParams(recibos.activo, recibos.criteria);

    useEffect(() => {
        emitir("recarga_de_recibos_solicitada", recibos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ReciboCompra">
            <MaestroDetalle<ReciboCompra>
                Maestro={
                    <>
                        <h2>Recibos de pago</h2>
                        <Listado<ReciboCompra>
                            metaTabla={metaTablaReciboCompra}
                            criteria={recibos.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaReciboCompra}
                            entidades={recibos.lista}
                            totalEntidades={recibos.total}
                            seleccionada={recibos.activo}
                            {...(remesasActivas && {
                                seleccionadas: seleccionados,
                                onMultiSeleccion: (ids: string[]) => emitir("seleccionados_cambiados", ids),
                                modoMultiseleccion: multiseleccion,
                                onModoMultiseleccionChanged: setMultiseleccion,
                            })}
                            renderAcciones={() =>
                                remesasActivas && multiseleccion && (
                                    <div className="maestro-botones">
                                        <QBoton
                                            onClick={() => emitir("remesado_solicitado")}
                                            deshabilitado={elegidos.length === 0}
                                        >
                                            {`Remesar (${elegidos.length})`}
                                        </QBoton>
                                    </div>
                                )
                            }
                            onSeleccion={(payload) => emitir("recibo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleReciboCompra id={recibos.activo} publicar={emitir} />}
                seleccionada={recibos.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "REMESANDO" && (
                <RemesarRecibosCompra recibos={elegidos} publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaReciboCompra = (recibo: ReciboCompra) => {
    return (
        <div className="tarjeta-recibo-compra" key={recibo.id}>
            <div className="tarjeta-recibo-compra-codigo">{recibo.codigo}</div>
            <div className="tarjeta-recibo-compra-importe">
                {formatearMoneda(recibo.importe, "EUR")}
            </div>
            <div className={`tarjeta-recibo-compra-estado estado-${recibo.estado}`}>
                {recibo.estado}
            </div>
        </div>
    );
};
