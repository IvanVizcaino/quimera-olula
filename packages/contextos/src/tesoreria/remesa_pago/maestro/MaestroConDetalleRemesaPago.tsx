import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla, QEtiqueta } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto, formatearMoneda, plugin } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { DetalleRemesaPago } from "../detalle/DetalleRemesaPago.js";
import { RemesaPago } from "../diseño.js";
import { varianteEstadoRemesaPago } from "../dominio.js";
import { CrearRemesaNominas } from "./crear_remesa_nominas/CrearRemesaNominas.js";
import "./MaestroConDetalleRemesaPago.css";
import { getMaquina } from "./maquina.js";

const metaTablaRemesaPago: MetaTabla<RemesaPago> = [
    { id: 'id', cabecera: 'ID' },
    { id: 'tipo', cabecera: 'Tipo' },
    { id: 'fecha', cabecera: 'Fecha', tipo: 'fecha' },
    { id: 'fechaPago', cabecera: 'F. Pago', tipo: 'fecha' },
    { id: 'cuentaId', cabecera: 'Cuenta' },
    { id: 'descripcionCuenta', cabecera: 'Descripción cuenta' },
    {
        id: 'estado',
        cabecera: 'Estado',
        render: (remesa: RemesaPago) => (
            <QEtiqueta variante={varianteEstadoRemesaPago(remesa.estado)}>
                {remesa.estado}
            </QEtiqueta>
        ),
    },
    {
        id: 'total',
        cabecera: 'Total',
        tipo: 'moneda',
        divisa: (r: RemesaPago) => r.divisaId,
    },
];

/**
 * Remesas de pago de recibos de proveedor y de nóminas. Las de recibos se
 * crean desde el maestro de recibos de pago; las de nóminas, aquí, si el
 * plugin de nóminas está activo.
 */
export const MaestroConDetalleRemesaPago = () => {

    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        remesas: listaActivaEntidadesInicial<RemesaPago>(id, criteriaInicial),
    });

    const { estado, remesas } = ctx;

    useUrlParams(remesas.activo, remesas.criteria);

    useEffect(() => {
        emitir("recarga_de_remesas_solicitada", remesas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const nominasActivas = plugin("nomina") === "activo";

    return (
        <div className="RemesaPago">
            <MaestroDetalle<RemesaPago>
                Maestro={
                    <>
                        <h2>Remesas de pago</h2>
                        <Listado<RemesaPago>
                            metaTabla={metaTablaRemesaPago}
                            criteria={remesas.criteria}
                            modoInicial="tabla"
                            tarjeta={TarjetaRemesaPago}
                            entidades={remesas.lista}
                            totalEntidades={remesas.total}
                            seleccionada={remesas.activo}
                            renderAcciones={() =>
                                nominasActivas && (
                                    <div className="maestro-botones">
                                        <QBoton onClick={() => emitir("crear_remesa_nominas_solicitado")}>
                                            Nueva remesa de nóminas
                                        </QBoton>
                                    </div>
                                )
                            }
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

            {estado === "CREANDO_REMESA_NOMINAS" && (
                <CrearRemesaNominas publicar={emitir} />
            )}
        </div>
    );
};

const TarjetaRemesaPago = (remesa: RemesaPago) => {
    return (
        <div className="tarjeta-remesa-pago" key={remesa.id}>
            <div className="tarjeta-remesa-pago-cuenta">
                {`${remesa.tipo} · ${remesa.descripcionCuenta || remesa.cuentaId}`}
            </div>
            <div className="tarjeta-remesa-pago-total">
                {formatearMoneda(remesa.total, remesa.divisaId)}
            </div>
            <QEtiqueta variante={varianteEstadoRemesaPago(remesa.estado)}>
                {remesa.estado}
            </QEtiqueta>
        </div>
    );
};
