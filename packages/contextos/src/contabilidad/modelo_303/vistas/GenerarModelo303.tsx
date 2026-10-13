import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTabla, MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
    CASILLAS_CLAVE_MODELO_303,
    ETIQUETA_CASILLA_MODELO_303,
    nombreFicheroExportAeatModelo303,
    parseModelo303Id,
} from "../dominio.ts";
import { DiffModelo303, Modelo303Cabecera, ResultadoGeneracionModelo303 } from "../diseño.ts";
import "#/comun/estilos/pagina_proceso.css";
import {
    getExportAeatModelo303,
    getGeneracionModelo303,
    getModelo303,
    patchGenerarModelo303,
} from "../infraestructura.ts";

const metaTablaDiffs: MetaTabla<DiffModelo303> = [
    { id: "clave", cabecera: "Casilla" },
    { id: "almacenado", cabecera: "En BD", tipo: "moneda" },
    { id: "calculado", cabecera: "Calculado", tipo: "moneda" },
    { id: "delta", cabecera: "Δ", tipo: "moneda" },
];

export const GenerarModelo303 = () => {
    const { intentar } = useContext(ContextoError);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const idParam = searchParams.get("id") ?? "";

    const [modeloIdTexto, setModeloIdTexto] = useState(idParam);
    const [resultado, setResultado] = useState<ResultadoGeneracionModelo303 | null>(null);
    const [cargandoPreview, setCargandoPreview] = useState(false);
    const [cargandoPersistir, setCargandoPersistir] = useState(false);
    const [cargandoExportAeat, setCargandoExportAeat] = useState(false);
    const [cabecera, setCabecera] = useState<Modelo303Cabecera | null>(null);

    const pluginOk = pluginActivo("modelo_303");
    const modeloId = useMemo(() => parseModelo303Id(modeloIdTexto), [modeloIdTexto]);

    useEffect(() => {
        if (idParam && idParam !== modeloIdTexto) setModeloIdTexto(idParam);
    }, [idParam, modeloIdTexto]);

    const cargarPreview = useCallback(async () => {
        if (!modeloId || cargandoPreview) return;

        setCargandoPreview(true);
        try {
            const datos = await intentar(() => getGeneracionModelo303(modeloId));
            setResultado(datos);
            setSearchParams({ id: String(modeloId) }, { replace: true });
        } finally {
            setCargandoPreview(false);
        }
    }, [cargandoPreview, intentar, modeloId, setSearchParams]);

    const persistir = useCallback(async () => {
        if (!modeloId || cargandoPersistir || cargandoPreview) return;

        setCargandoPersistir(true);
        try {
            await intentar(() => patchGenerarModelo303(modeloId));
            const datos = await intentar(() => getGeneracionModelo303(modeloId));
            setResultado(datos);
        } finally {
            setCargandoPersistir(false);
        }
    }, [cargandoPersistir, cargandoPreview, intentar, modeloId]);

    const descargarAeat = useCallback(async () => {
        if (!modeloId || cargandoExportAeat || cargandoPreview || cargandoPersistir) return;

        setCargandoExportAeat(true);
        try {
            let meta = cabecera;
            if (!meta || meta.modeloId !== modeloId) {
                meta = await intentar(() => getModelo303(modeloId));
                setCabecera(meta);
            }
            const blob = await intentar(() => getExportAeatModelo303(modeloId));
            await descargarDocumento(blob, nombreFicheroExportAeatModelo303(meta));
        } finally {
            setCargandoExportAeat(false);
        }
    }, [
        cabecera,
        cargandoExportAeat,
        cargandoPersistir,
        cargandoPreview,
        intentar,
        modeloId,
    ]);

    const totales = resultado?.calculado;
    const ocupado = cargandoPreview || cargandoPersistir || cargandoExportAeat;

    return (
        <div className="InformeContable GenerarModelo303">
            <h2>Modelo 303 — generación</h2>

            {!pluginOk && (
                <p className="aviso aviso-advertencia" role="status">
                    El plugin <strong>modelo_303</strong> no está activo en esta instalación. La API puede
                    devolver error.
                </p>
            )}

            <p className="maestro-botones">
                <QBoton variante="borde" onClick={() => navigate("/contabilidad/modelo_303")}>
                    Volver al listado
                </QBoton>
            </p>

            <div className="filtros-informe">
                <QInput
                    label="Id modelo 303"
                    nombre="modelo303_id"
                    valor={modeloIdTexto}
                    onChange={setModeloIdTexto}
                    tipo="entero"
                />
            </div>

            <div className="maestro-botones">
                <QBoton
                    onClick={cargarPreview}
                    deshabilitado={!modeloId || cargandoPreview || cargandoPersistir}
                >
                    {cargandoPreview ? "Calculando…" : "Calcular (preview)"}
                </QBoton>
                <QBoton
                    onClick={persistir}
                    deshabilitado={!modeloId || !resultado || ocupado}
                >
                    {cargandoPersistir ? "Persistiendo…" : "Persistir casillas calculadas"}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={descargarAeat}
                    deshabilitado={!modeloId || ocupado}
                >
                    {cargandoExportAeat ? "Descargando…" : "Descargar AEAT (.303)"}
                </QBoton>
            </div>

            {resultado && (
                <section className="informe-cabecera">
                    <p>
                        Modelo <strong>{resultado.modeloId}</strong> · Ejercicio{" "}
                        <strong>{resultado.codejercicio}</strong> · Periodo{" "}
                        {resultado.fechaInicio} — {resultado.fechaFin}
                    </p>
                    <p>
                        Estado:{" "}
                        {resultado.coincide ? (
                            <strong className="texto-ok">Coincide con la BD</strong>
                        ) : (
                            <strong className="texto-advertencia">
                                Hay diferencias ({resultado.diffs.length})
                            </strong>
                        )}
                    </p>
                </section>
            )}

            {totales && (
                <section className="modelo303-totales">
                    <h3>Totales principales (calculados)</h3>
                    <table className="qtabla-resumen">
                        <tbody>
                            {CASILLAS_CLAVE_MODELO_303.map((clave) => (
                                <tr key={clave}>
                                    <th scope="row">{ETIQUETA_CASILLA_MODELO_303[clave]}</th>
                                    <td>{formatearMoneda(totales[clave] ?? 0, "EUR")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {resultado && resultado.diffs.length > 0 && (
                <section>
                    <h3>Diferencias respecto a la BD</h3>
                    <QTabla
                        metaTabla={metaTablaDiffs}
                        datos={resultado.diffs}
                        cargando={cargandoPreview}
                        orden={["clave", "ASC"]}
                        totalEntidades={resultado.diffs.length}
                    />
                </section>
            )}
        </div>
    );
};
