import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { Listado } from "@olula/componentes/maestro/Listado.js";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { listaActivaEntidadesInicial } from "@olula/lib/ListaActivaEntidades.js";
import { getUrlParams, useUrlParams } from "@olula/lib/url-params.js";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { nombreFicheroExportAeatModelo303 } from "../../dominio.ts";
import { ItemModelo303 } from "../../diseño.ts";
import { getExportAeatModelo303 } from "../../infraestructura.ts";
import { metaTablaModelo303 } from "./diseño.ts";
import { getMaquina } from "./maquina.ts";
import "#/comun/estilos/pagina_proceso.css";

const criteriaModelos303Base = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["fecha_inicio", "DESC"],
});

export const MaestroModelo303 = () => {
    const { intentar } = useContext(ContextoError);
    const navigate = useNavigate();
    const [cargandoExportAeat, setCargandoExportAeat] = useState(false);
    const criteriaBase = useMemo(() => criteriaModelos303Base(), []);
    const { id, criteria } = getUrlParams();
    const criteriaInicial = criteria.filtro.length > 0 ? criteria : criteriaBase;

    const { ctx, emitir } = useMaquina(getMaquina, {
        estado: "INICIAL",
        modelos: listaActivaEntidadesInicial<ItemModelo303>(id, criteriaInicial),
    });

    useUrlParams(ctx.modelos.activo, ctx.modelos.criteria);

    useEffect(() => {
        emitir("recarga_de_modelos_solicitada", ctx.modelos.criteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const abrirGeneracion = useCallback(
        (modeloId: number) => {
            navigate(`/contabilidad/modelo_303?id=${modeloId}`);
        },
        [navigate]
    );

    const onSeleccion = useCallback(
        (seleccionada: string) => {
            emitir("modelo_seleccionado", seleccionada);
            const entidad = ctx.modelos.lista.find((m) => m.id === seleccionada);
            if (entidad?.modeloId) abrirGeneracion(entidad.modeloId);
        },
        [abrirGeneracion, ctx.modelos.lista, emitir]
    );

    const activo = ctx.modelos.lista.find((m) => m.id === ctx.modelos.activo);

    const descargarAeat = useCallback(async () => {
        if (!activo?.modeloId || cargandoExportAeat) return;

        setCargandoExportAeat(true);
        try {
            const blob = await intentar(() => getExportAeatModelo303(activo.modeloId));
            await descargarDocumento(blob, nombreFicheroExportAeatModelo303(activo));
        } finally {
            setCargandoExportAeat(false);
        }
    }, [activo, cargandoExportAeat, intentar]);

    return (
        <div className="PaginaProceso Modelo303 MaestroModelo303">
            <header className="pagina-proceso__cabecera">
                <h2>Modelo 303</h2>
                <p className="aviso aviso-info" role="status">
                    Selecciona un periodo para calcular y persistir las casillas (generación).
                </p>
            </header>
            <Listado<ItemModelo303>
                metaTabla={metaTablaModelo303}
                criteria={ctx.modelos.criteria}
                modo="tabla"
                entidades={ctx.modelos.lista}
                totalEntidades={ctx.modelos.total}
                seleccionada={ctx.modelos.activo}
                renderAcciones={() => (
                    <div className="maestro-botones">
                        <QBoton
                            deshabilitado={!activo?.modeloId}
                            onClick={() => activo?.modeloId && abrirGeneracion(activo.modeloId)}
                        >
                            Generar…
                        </QBoton>
                        <QBoton
                            variante="borde"
                            deshabilitado={!activo?.modeloId || cargandoExportAeat}
                            onClick={descargarAeat}
                        >
                            {cargandoExportAeat ? "Descargando…" : "Descargar AEAT (.303)"}
                        </QBoton>
                    </div>
                )}
                onSeleccion={onSeleccion}
                onCriteriaChanged={(payload) => emitir("criteria_cambiado", payload)}
                onSiguientePagina={(payload) => emitir("siguiente_pagina", payload)}
            />
        </div>
    );
};
