import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useEffect, useMemo } from "react";
import { UsuarioTenant } from "../diseño.js";
import { CrearUsuarioTenant } from "../crear/CrearUsuarioTenant.js";
import { DetalleUsuarioTenant } from "../detalle/DetalleUsuarioTenant.js";
import { getMaquina } from "./maquina.js";

const metaTablaUsuarioTenant: MetaTabla<UsuarioTenant> = [
    { id: 'nombre', cabecera: 'Nombre' },
    { id: 'email', cabecera: 'Email' },
    { id: 'clienteId', cabecera: 'Cliente' },
    {
        id: 'activo',
        cabecera: 'Activo',
        render: (u: UsuarioTenant) => u.activo ? 'Sí' : 'No',
    },
];

export const MaestroConDetalleUsuarioTenant = () => {

    const criteriaBase = useMemo(() => criteriaDefecto, []);
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        usuarios: listaActivaEntidadesInicial<UsuarioTenant>(id, criteriaInicial),
    });

    const { estado, usuarios } = ctx;

    useUrlParams(usuarios.activo, usuarios.criteria);

    useEffect(() => {
        emitir("recarga_de_usuarios_solicitada", usuarios.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="UsuariosTenant">
            <MaestroDetalle<UsuarioTenant>
                Maestro={
                    <>
                        <h2>Usuarios Tenant</h2>
                        <Listado<UsuarioTenant>
                            metaTabla={metaTablaUsuarioTenant}
                            criteria={usuarios.criteria}
                            modoInicial="tabla"
                            entidades={usuarios.lista}
                            totalEntidades={usuarios.total}
                            seleccionada={usuarios.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_usuario_solicitado")}>
                                        Nuevo Usuario
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("usuario_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleUsuarioTenant id={usuarios.activo} publicar={emitir} />}
                seleccionada={usuarios.activo}
                modoDisposicion="maestro-50"
            />

            {estado === "CREANDO" && (
                <CrearUsuarioTenant publicar={emitir} />
            )}
        </div>
    );
};
