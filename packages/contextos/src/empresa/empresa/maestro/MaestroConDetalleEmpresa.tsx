import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { CrearEmpresa } from "../crear/CrearEmpresa.js";
import { DetalleEmpresa } from "../detalle/DetalleEmpresa.js";
import { Empresa } from "../diseño.js";
import "./MaestroConDetalleEmpresa.css";
import { getMaquina } from "./maquina.js";

const metaTablaEmpresa: MetaTabla<Empresa> = [
    { id: 'nombre', cabecera: 'Nombre' },
    { id: 'cifNif', cabecera: 'CIF/NIF' },
    { id: 'administrador', cabecera: 'Administrador' },
    { id: 'ciudad', cabecera: 'Ciudad' },
];

export const MaestroConDetalleEmpresa = () => {

    const criteriaBase = useMemo(() => criteriaDefecto, []);

    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        empresas: listaActivaEntidadesInicial<Empresa>(id, criteriaInicial),
    });

    const { estado, empresas } = ctx;

    useUrlParams(empresas.activo, empresas.criteria);

    useEffect(() => {
        emitir("recarga_de_empresas_solicitada", empresas.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Empresa">
            <MaestroDetalle<Empresa>
                Maestro={
                    <>
                        <h2>Empresas</h2>
                        <Listado<Empresa>
                            metaTabla={metaTablaEmpresa}
                            criteria={empresas.criteria}
                            tarjeta={TarjetaEmpresa}
                            entidades={empresas.lista}
                            totalEntidades={empresas.total}
                            seleccionada={empresas.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_empresa_solicitada")}>
                                        Nueva empresa
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("empresa_seleccionada", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleEmpresa id={empresas.activo} publicar={emitir} />}
                seleccionada={empresas.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearEmpresa
                    publicar={emitir}
                />
            )}
        </div>
    );
};

const TarjetaEmpresa = (empresa: Empresa) => {
    return (
        <div className="tarjeta-empresa" key={empresa.id}>
            <div className="tarjeta-empresa-nombre">{empresa.nombre}</div>
            <div className="tarjeta-empresa-cif">{empresa.cifNif}</div>
        </div>
    );
};
