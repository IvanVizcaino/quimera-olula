import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { ClienteTenant } from "../diseño.js";
import { CrearClienteTenant } from "../crear/CrearClienteTenant.js";
import { DetalleClienteTenant } from "../detalle/DetalleClienteTenant.js";
import { getMaquina } from "./maquina.js";

const metaTablaClienteTenant: MetaTabla<ClienteTenant> = [
    { id: 'id', cabecera: 'ID' },
    { id: 'nombre', cabecera: 'Nombre' },
    {
        id: 'activo',
        cabecera: 'Activo',
        render: (c: ClienteTenant) => c.activo ? 'Sí' : 'No',
    },
];

export const MaestroConDetalleClienteTenant = () => {

    const criteriaBase = useMemo(() => criteriaDefecto, []);
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        clientes: listaActivaEntidadesInicial<ClienteTenant>(id, criteriaInicial),
    });

    const { estado, clientes } = ctx;

    useUrlParams(clientes.activo, clientes.criteria);

    useEffect(() => {
        emitir("recarga_de_clientes_solicitada", clientes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="ClientesTenant">
            <MaestroDetalle<ClienteTenant>
                Maestro={
                    <>
                        <h2>Clientes Tenant</h2>
                        <Listado<ClienteTenant>
                            metaTabla={metaTablaClienteTenant}
                            criteria={clientes.criteria}
                            modoInicial="tabla"
                            entidades={clientes.lista}
                            totalEntidades={clientes.total}
                            seleccionada={clientes.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_cliente_solicitado")}>
                                        Nuevo Cliente
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("cliente_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleClienteTenant id={clientes.activo} publicar={emitir} />}
                seleccionada={clientes.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearClienteTenant publicar={emitir} />
            )}
        </div>
    );
};
