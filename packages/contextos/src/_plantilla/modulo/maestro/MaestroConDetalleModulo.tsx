import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QIcono } from "@olula/componentes/atomos/qicono.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { MetaTabla } from "@olula/componentes/index.js";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { MaestroDetalle } from "@olula/componentes/maestro/MaestroDetalle.tsx";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useLayout } from "@olula/lib/useLayout.js";
import { useEffect, useMemo } from "react";
import { CrearModulo } from "../crear/CrearModulo.js";
import { DetalleModulo } from "../detalle/DetalleModulo.js";
import { Modulo } from "../diseño.js";
import "./MaestroConDetalleModulo.css";
import { getMaquina } from "./maquina.js";

/**
 * Metadatos para renderizar la tabla.
 *
 * Opciones de columna:
 *   - Sin nada extra     → renderiza el valor tal cual
 *   - tipo: "fecha"      → formatea como fecha
 *   - tipo: "moneda"     → formatea como moneda con divisa
 *   - render: (m) => ... → render personalizado
 */
const metaTablaModulo: MetaTabla<Modulo> = [
    { id: 'id', cabecera: 'ID' },
    { id: 'campoString', cabecera: 'C. String' },
    { id: 'campoNumero', cabecera: 'C. Numero' },
    {
        id: 'campoOpcion',
        cabecera: 'Opción',
        render: (m: Modulo) => m.campoOpcion.toUpperCase(),
    },
    { id: 'campoFecha', cabecera: 'Fecha', tipo: 'fecha', },
];

/**
 * Componente principal: listado (maestro) + detalle.
 *
 * Patrones aplicados:
 *   - useLayout        → alterna entre vista TARJETA y TABLA
 *   - useUrlParams     → escribe activo y criteria en la URL al cambiar
 *   - getUrlParams     → lee el estado inicial desde la URL (deep link)
 *   - listaActivaEntidadesInicial → inicializa con ID y criteria de la URL
 *   - Listado          → gestiona criteria internamente; emite onCriteriaChanged y onSiguientePagina
 *   - MaestroDetalle   → recibe layout para adaptar la disposición en móvil
 *   - CREANDO          → modal de alta; crear_modulo_solicitado → CREANDO → modulo_creado|alta_de_modulo_cancelada → INICIAL
 */
export const MaestroConDetalleModulo = () => {

    // Criteria base del módulo (orden por defecto, etc.)
    const criteriaBase = useMemo(() => criteriaDefecto, []);

    // Alterna entre vista TARJETA y TABLA; en móvil siempre usa TARJETA
    const { layout, cambiarLayout } = useLayout("TARJETA");

    // Lee el activo y criteria iniciales desde la URL
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        modulos: listaActivaEntidadesInicial<Modulo>(id, criteriaInicial),
    });

    const { estado, modulos } = ctx;

    // Escribe activo y criteria en la URL al cambiar
    useUrlParams(modulos.activo, modulos.criteria);

    // Carga inicial
    useEffect(() => {
        emitir("recarga_de_modulos_solicitada", modulos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="Modulo">
            <MaestroDetalle<Modulo>
                Maestro={
                    <>
                        <h2>Módulos</h2>
                        <div className="maestro-botones">
                            <span
                                className="cambio-modo-icono"
                                onClick={cambiarLayout}
                            >
                                <QIcono
                                    nombre={layout === "TABLA" ? "lista" : "tabla"}
                                    tamaño="md"
                                />
                            </span>
                        </div>
                        <Listado<Modulo>
                            metaTabla={metaTablaModulo}
                            criteria={modulos.criteria}
                            modo={layout === "TARJETA" ? "tarjetas" : "tabla"}
                            tarjeta={TarjetaModulo}
                            entidades={modulos.lista}
                            totalEntidades={modulos.total}
                            seleccionada={modulos.activo}
                            renderAcciones={() => (
                                <div className="maestro-botones">
                                    <QBoton onClick={() => emitir("crear_modulo_solicitado")}>
                                        Nuevo Módulo
                                    </QBoton>
                                </div>
                            )}
                            onSeleccion={(payload) => emitir("modulo_seleccionado", payload)}
                            onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                            onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
                        />
                    </>
                }
                Detalle={<DetalleModulo id={modulos.activo} publicar={emitir} />}
                layout={layout}
                seleccionada={modulos.activo}
                modoDisposicion="maestro-50"
            />
            
             {/* Modales condicionales: se activan según el estado de la máquina */}
            {estado === "CREANDO" && (
                <CrearModulo
                    publicar={emitir}
                />
            )}
        </div>
    );
};

/**
 * Componente tarjeta para la vista de lista en modo tarjetas.
 * Se define fuera del componente principal para evitar re-renders.
 */
const TarjetaModulo = (modulo: Modulo) => {
    return (
        <div className="tarjeta-modulo" key={modulo.id}>
            <div className="tarjeta-modulo-nombre">{modulo.campoString}</div>
            <div className={`tarjeta-modulo-estado estado-${modulo.campoOpcion}`}>
                {modulo.campoOpcion}
            </div>
        </div>
    );
};
