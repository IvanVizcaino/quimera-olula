import { QEtiqueta } from "@olula/componentes/atomos/qetiqueta.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { DetalleRemesaPago } from "../detalle/DetalleRemesaPago.js";
import { RemesaPago } from "../diseño.js";
import "./MaestroConDetalleRemesaPago.css";
import { getMaquina } from "./maquina.js";

const metaTablaRemesaPago: MetaTabla<RemesaPago> = [
    { id: 'id', cabecera: 'ID' },
    { id: 'fecha', cabecera: 'Fecha', tipo: 'fecha' },
    { id: 'fechaCargo', cabecera: 'F. Cargo', tipo: 'fecha' },
    { id: 'cuentaId', cabecera: 'Cuenta' },
    { id: 'estado', cabecera: 'Estado' },
    {
        id: 'total',
        cabecera: 'Total',
        tipo: 'moneda',
        divisa: (r: RemesaPago) => r.divisaId,
    },
];

export const MaestroConDetalleRemesaPago = () => {

    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        remesas: listaActivaEntidadesInicial<RemesaPago>(id, criteriaInicial),
    });

    const { remesas } = ctx;

    useUrlParams(remesas.activo, remesas.criteria);

    useEffect(() => {
        emitir("recarga_de_remesas_solicitada", remesas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="RemesaPago">
            <MaestroDetalle<RemesaPago>
                Maestro={
                    <>
                        <h2>Remesas de pago</h2>
                        <QEtiqueta variante="primario">
                            Requiere la extensión Eneboo <strong>remesas_prov</strong> en la base de datos.
                        </QEtiqueta>
                        <Listado<RemesaPago>
                            metaTabla={metaTablaRemesaPago}
                            criteria={remesas.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaRemesaPago}
                            entidades={remesas.lista}
                            totalEntidades={remesas.total}
                            seleccionada={remesas.activo}
                            onSeleccion={(payload) => emitir("remesa_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleRemesaPago id={remesas.activo} publicar={emitir} />}
                seleccionada={remesas.activo}
                modoDisposicion="maestro-50"
            />
        </div>
    );
};

const TarjetaRemesaPago = (remesa: RemesaPago) => {
    return (
        <div className="tarjeta-remesa-pago" key={remesa.id}>
            <div className="tarjeta-remesa-pago-cuenta">{remesa.cuentaId}</div>
            <div className="tarjeta-remesa-pago-total">
                {formatearMoneda(remesa.total, remesa.divisaId)}
            </div>
            <div className={`tarjeta-remesa-pago-estado estado-${remesa.estado}`}>
                {remesa.estado}
            </div>
        </div>
    );
};
