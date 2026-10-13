import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
    CLAVES_TOTALES_MODELO_349,
    ETIQUETA_TOTAL_MODELO_349,
    nombreFicheroExportAeatModelo349,
    parseModelo349Id,
} from "../dominio.ts";
import { DiffTotalModelo349, Operacion349, ResultadoGeneracionModelo349 } from "../diseño.ts";
import {
import "#/comun/estilos/pagina_proceso.css";
    getDatosModelo349,
    getExportAeatModelo349,
    getGeneracionModelo349,
    patchGenerarModelo349,
} from "../infraestructura.ts";

const metaTablaDiffs: MetaTabla<DiffTotalModelo349> = [
    { id: "clave", cabecera: "Campo" },
    { id: "almacenado", cabecera: "En BD", tipo: "moneda" },
    { id: "calculado", cabecera: "Calculado", tipo: "moneda" },
    { id: "delta", cabecera: "Δ", tipo: "moneda" },
];

const metaTablaOperaciones: MetaTabla<Operacion349> = [
    { id: "clave", cabecera: "Clave" },
    { id: "cifnif", cabecera: "CIF/NIF" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "codcliente", cabecera: "Cliente" },
    { id: "codproveedor", cabecera: "Proveedor" },
    { id: "codpais", cabecera: "País" },
    { id: "codue", cabecera: "UE" },
    { id: "baseimponible", cabecera: "Base", tipo: "moneda" },
];

export const GenerarModelo349 = () => {
    const { intentar } = useContext(ContextoError);
    const [searchParams, setSearchParams] = useSearchParams();
    const idParam = searchParams.get("id") ?? "";

    const [modeloIdTexto, setModeloIdTexto] = useState(idParam);
    const [resultado, setResultado] = useState<ResultadoGeneracionModelo349 | null>(null);
    const [datosBd, setDatosBd] = useState<Operacion349[] | null>(null);
    const [cargandoPreview, setCargandoPreview] = useState(false);
    const [cargandoPersistir, setCargandoPersistir] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(false);
    const [cargandoExportAeat, setCargandoExportAeat] = useState(false);

    const pluginOk = pluginActivo("modelo_349");
    const modeloId = useMemo(() => parseModelo349Id(modeloIdTexto), [modeloIdTexto]);

    useEffect(() => {
        if (idParam && idParam !== modeloIdTexto) setModeloIdTexto(idParam);
    }, [idParam, modeloIdTexto]);

    const sincronizarUrl = useCallback(
        (id: number) => setSearchParams({ id: String(id) }, { replace: true }),
        [setSearchParams]
    );

    const cargarPreview = useCallback(async () => {
        if (!modeloId || cargandoPreview) return;

        setCargandoPreview(true);
        try {
            const datos = await intentar(() => getGeneracionModelo349(modeloId));
            setResultado(datos);
            sincronizarUrl(modeloId);
        } finally {
            setCargandoPreview(false);
        }
    }, [cargandoPreview, intentar, modeloId, sincronizarUrl]);

    const persistir = useCallback(async () => {
        if (!modeloId || cargandoPersistir || cargandoPreview) return;

        setCargandoPersistir(true);
        try {
            await intentar(() => patchGenerarModelo349(modeloId));
            const datos = await intentar(() => getGeneracionModelo349(modeloId));
            setResultado(datos);
            setDatosBd(null);
        } finally {
            setCargandoPersistir(false);
        }
    }, [cargandoPersistir, cargandoPreview, intentar, modeloId]);

    const cargarDatosBd = useCallback(async () => {
        if (!modeloId || cargandoDatos) return;

        setCargandoDatos(true);
        try {
            const filas = await intentar(() => getDatosModelo349(modeloId));
            setDatosBd(filas);
            sincronizarUrl(modeloId);
        } finally {
            setCargandoDatos(false);
        }
    }, [cargandoDatos, intentar, modeloId, sincronizarUrl]);

    const descargarAeat = useCallback(async () => {
        if (!modeloId || cargandoExportAeat || cargandoPreview || cargandoPersistir) return;

        setCargandoExportAeat(true);
        try {
            let ejercicio = resultado?.codejercicio ?? "";
            if (!ejercicio.trim()) {
                const gen = await intentar(() => getGeneracionModelo349(modeloId));
                ejercicio = gen.codejercicio;
            }
            const blob = await intentar(() => getExportAeatModelo349(modeloId));
            await descargarDocumento(blob, nombreFicheroExportAeatModelo349(ejercicio, modeloId));
        } finally {
            setCargandoExportAeat(false);
        }
    }, [
        cargandoExportAeat,
        cargandoPersistir,
        cargandoPreview,
        intentar,
        modeloId,
        resultado?.codejercicio,
    ]);

    const totalesPreview = resultado
        ? {
              numtotaloi: resultado.numtotaloi,
              importetotaloi: resultado.importetotaloi,
              numtotaloirec: resultado.numtotaloirec,
              importetotaloirec: resultado.importetotaloirec,
          }
        : null;

    const ocupado = cargandoPreview || cargandoPersistir || cargandoDatos || cargandoExportAeat;

    const formatearTotal = (clave: (typeof CLAVES_TOTALES_MODELO_349)[number], valor: number) =>
        clave.startsWith("num") ? String(valor) : formatearMoneda(valor, "EUR");

    return (
        <div className="InformeContable GenerarModelo349">
            <h2>Modelo 349 — generación</h2>

            {!pluginOk && (
                <p className="aviso aviso-advertencia" role="status">
                    El plugin <strong>modelo_349</strong> no está activo en esta instalación. La API puede
                    devolver error.
                </p>
            )}

            <p className="aviso aviso-info" role="status">
                Introduce el <strong>id</strong> de <code>co_modelo349</code>. También puedes abrir{" "}
                <code>/contabilidad/modelo_349?id=…</code>.
            </p>

            <div className="filtros-informe">
                <QInput
                    label="Id modelo 349"
                    nombre="modelo349_id"
                    valor={modeloIdTexto}
                    onChange={setModeloIdTexto}
                    tipo="entero"
                />
            </div>

            <div className="maestro-botones">
                <QBoton onClick={cargarPreview} deshabilitado={!modeloId || ocupado}>
                    {cargandoPreview ? "Calculando…" : "Calcular (preview)"}
                </QBoton>
                <QBoton onClick={persistir} deshabilitado={!modeloId || !resultado || ocupado}>
                    {cargandoPersistir ? "Persistiendo…" : "Persistir operaciones calculadas"}
                </QBoton>
                <QBoton onClick={cargarDatosBd} deshabilitado={!modeloId || ocupado}>
                    {cargandoDatos ? "Cargando…" : "Listar datos en BD"}
                </QBoton>
                <QBoton variante="borde" onClick={descargarAeat} deshabilitado={!modeloId || ocupado}>
                    {cargandoExportAeat ? "Descargando…" : "Descargar AEAT (.349)"}
                </QBoton>
            </div>

            {resultado && (
                <section className="informe-cabecera">
                    <p>
                        Modelo <strong>{resultado.modeloId}</strong> · Ejercicio{" "}
                        <strong>{resultado.codejercicio}</strong>
                    </p>
                    <p>
                        Estado:{" "}
                        {resultado.coincide ? (
                            <strong className="texto-ok">Coincide con la BD</strong>
                        ) : (
                            <strong className="texto-advertencia">
                                Hay diferencias (totales: {resultado.diffsTotales.length}, operaciones:{" "}
                                {resultado.diffsOperaciones.length})
                            </strong>
                        )}
                    </p>
                </section>
            )}

            {totalesPreview && (
                <section className="modelo349-totales">
                    <h3>Totales (calculados en preview)</h3>
                    <table className="qtabla-resumen">
                        <tbody>
                            {CLAVES_TOTALES_MODELO_349.map((clave) => (
                                <tr key={clave}>
                                    <th scope="row">{ETIQUETA_TOTAL_MODELO_349[clave]}</th>
                                    <td>{formatearTotal(clave, totalesPreview[clave])}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {resultado && resultado.diffsTotales.length > 0 && (
                <section>
                    <h3>Diferencias en totales de cabecera</h3>
                    <QTabla
                        metaTabla={metaTablaDiffs}
                        datos={resultado.diffsTotales}
                        cargando={cargandoPreview}
                        orden={["clave", "ASC"]}
                        totalEntidades={resultado.diffsTotales.length}
                    />
                </section>
            )}

            {resultado && resultado.diffsOperaciones.length > 0 && (
                <section>
                    <h3>Diferencias en operaciones (resumen)</h3>
                    <pre className="modelo349-diffs-operaciones">
                        {JSON.stringify(resultado.diffsOperaciones, null, 2)}
                    </pre>
                </section>
            )}

            {resultado && resultado.operaciones.length > 0 && (
                <section>
                    <h3>Operaciones calculadas (preview)</h3>
                    <QTabla
                        metaTabla={metaTablaOperaciones}
                        datos={resultado.operaciones}
                        cargando={cargandoPreview}
                        orden={["baseimponible", "DESC"]}
                        totalEntidades={resultado.operaciones.length}
                    />
                </section>
            )}

            {datosBd && (
                <section>
                    <h3>Operaciones en BD ({datosBd.length})</h3>
                    <QTabla
                        metaTabla={metaTablaOperaciones}
                        datos={datosBd}
                        cargando={cargandoDatos}
                        orden={["baseimponible", "DESC"]}
                        totalEntidades={datosBd.length}
                    />
                </section>
            )}
        </div>
    );
};
