import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearAgente } from "../crear/CrearAgente.js";
import { DetalleAgente } from "../detalle/DetalleAgente.js";
import { Agente } from "../diseño.js";
import { getMaquina } from "./maquina.js";
import { TarjetaAgente } from "./TarjetaAgente.tsx";

const metaTablaAgente: MetaTabla<Agente> = [
    { id: 'id', cabecera: 'ID' },
    { id: 'nombre', cabecera: 'Nombre' },
    { id: 'id_fiscal', cabecera: 'Id Fiscal' },
    { id: 'por_comision', cabecera: '% Comisión', tipo: 'numero' },
    { id: 'telefono', cabecera: 'Teléfono' },
    { id: 'email', cabecera: 'Email' },
    { id: 'ciudad', cabecera: 'Ciudad' },
];

export const MaestroConDetalleAgente = () => {

    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        agentes: listaActivaEntidadesInicial<Agente>(id, criteriaInicial),
    });

    const { estado, agentes } = ctx;

    useUrlParams(agentes.activo, agentes.criteria);

    useEffect(() => {
        emitir("recarga_de_agentes_solicitada", agentes.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Agente">
            <MaestroDetalle<Agente>
                Maestro={
                    <>
                        <h2>Agentes comerciales</h2>
                        <Listado<Agente>
                            metaTabla={metaTablaAgente}
                            criteria={agentes.criteria}
                            modoInicial="tarjetas"
                            tarjeta={TarjetaAgente}
                            entidades={agentes.lista}
                            totalEntidades={agentes.total}
                            seleccionada={agentes.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_agente_solicitado")}>
                                        Nuevo agente
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("agente_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleAgente id={agentes.activo} publicar={emitir} />}
                seleccionada={agentes.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearAgente
                    publicar={emitir}
                />
            )}
        </div>
    );
};
