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
    CLAVES_TOTALES_MODELO_340,
    ETIQUETA_TOTAL_MODELO_340,
    etiquetaTipoLibro340,
    nombreFicheroExportAeatModelo340,
    parseModelo340Id,
} from "../dominio.ts";
import { DiffTotalModelo340, Registro340, ResultadoGeneracionModelo340 } from "../diseño.ts";
import {
import "#/comun/estilos/pagina_proceso.css";
    getDatosModelo340,
    getExportAeatModelo340,
    getGeneracionModelo340,
    patchGenerarModelo340,
} from "../infraestructura.ts";

const metaTablaDiffs: MetaTabla<DiffTotalModelo340> = [
    { id: "clave", cabecera: "Campo" },
    { id: "almacenado", cabecera: "En BD", tipo: "moneda" },
    { id: "calculado", cabecera: "Calculado", tipo: "moneda" },
    { id: "delta", cabecera: "Δ", tipo: "moneda" },
];

const metaTablaRegistros: MetaTabla<Registro340> = [
    { id: "tipolibro", cabecera: "Libro", render: (r) => etiquetaTipoLibro340(r.tipolibro) },
    { id: "idenfactura", cabecera: "Factura" },
    { id: "apellidosnomrs", cabecera: "Tercero" },
    { id: "cifnif", cabecera: "CIF/NIF" },
    { id: "baseimponible", cabecera: "Base", tipo: "moneda" },
    { id: "cuotaimpuesto", cabecera: "Cuota", tipo: "moneda" },
    { id: "operacion", cabecera: "Operación" },
];

export const GenerarModelo340 = () => {
    const { intentar } = useContext(ContextoError);
    const [searchParams, setSearchParams] = useSearchParams();
    const idParam = searchParams.get("id") ?? "";

    const [modeloIdTexto, setModeloIdTexto] = useState(idParam);
    const [resultado, setResultado] = useState<ResultadoGeneracionModelo340 | null>(null);
    const [datosBd, setDatosBd] = useState<Registro340[] | null>(null);
    const [cargandoPreview, setCargandoPreview] = useState(false);
    const [cargandoPersistir, setCargandoPersistir] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(false);
    const [cargandoExportAeat, setCargandoExportAeat] = useState(false);

    const pluginOk = pluginActivo("modelo_340");
    const modeloId = useMemo(() => parseModelo340Id(modeloIdTexto), [modeloIdTexto]);

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
            const datos = await intentar(() => getGeneracionModelo340(modeloId));
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
            await intentar(() => patchGenerarModelo340(modeloId));
            const datos = await intentar(() => getGeneracionModelo340(modeloId));
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
            const filas = await intentar(() => getDatosModelo340(modeloId));
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
                const gen = await intentar(() => getGeneracionModelo340(modeloId));
                ejercicio = gen.codejercicio;
            }
            const blob = await intentar(() => getExportAeatModelo340(modeloId));
            await descargarDocumento(blob, nombreFicheroExportAeatModelo340(ejercicio, modeloId));
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
              registros: resultado.registros,
              baseimponible: resultado.baseimponible,
              cuotaimpuesto: resultado.cuotaimpuesto,
              totalfacturas: resultado.totalfacturas,
          }
        : null;

    const ocupado = cargandoPreview || cargandoPersistir || cargandoDatos || cargandoExportAeat;

    const formatearTotal = (clave: (typeof CLAVES_TOTALES_MODELO_340)[number], valor: number) =>
        clave === "registros" ? String(valor) : formatearMoneda(valor, "EUR");

    return (
        <div className="InformeContable GenerarModelo340">
            <h2>Modelo 340 — generación</h2>

            {!pluginOk && (
                <p className="aviso aviso-advertencia" role="status">
                    El plugin <strong>modelo_340</strong> no está activo en esta instalación. La API puede
                    devolver error.
                </p>
            )}

            <p className="aviso aviso-info" role="status">
                Introduce el <strong>id</strong> de <code>co_modelo340</code>. También puedes abrir{" "}
                <code>/contabilidad/modelo_340?id=…</code>.
            </p>

            <div className="filtros-informe">
                <QInput
                    label="Id modelo 340"
                    nombre="modelo340_id"
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
                    {cargandoPersistir ? "Persistiendo…" : "Persistir facturas calculadas"}
                </QBoton>
                <QBoton onClick={cargarDatosBd} deshabilitado={!modeloId || ocupado}>
                    {cargandoDatos ? "Cargando…" : "Listar datos en BD"}
                </QBoton>
                <QBoton variante="borde" onClick={descargarAeat} deshabilitado={!modeloId || ocupado}>
                    {cargandoExportAeat ? "Descargando…" : "Descargar AEAT (.340)"}
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
                                Hay diferencias en totales ({resultado.diffsTotales.length})
                            </strong>
                        )}
                    </p>
                </section>
            )}

            {totalesPreview && (
                <section className="modelo340-totales">
                    <h3>Totales (calculados en preview)</h3>
                    <table className="qtabla-resumen">
                        <tbody>
                            {CLAVES_TOTALES_MODELO_340.map((clave) => (
                                <tr key={clave}>
                                    <th scope="row">{ETIQUETA_TOTAL_MODELO_340[clave]}</th>
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

            {resultado && resultado.emitidas.length > 0 && (
                <section>
                    <h3>Facturas emitidas (preview)</h3>
                    <QTabla
                        metaTabla={metaTablaRegistros}
                        datos={resultado.emitidas}
                        cargando={cargandoPreview}
                        orden={["baseimponible", "DESC"]}
                        totalEntidades={resultado.emitidas.length}
                    />
                </section>
            )}

            {resultado && resultado.recibidas.length > 0 && (
                <section>
                    <h3>Facturas recibidas (preview)</h3>
                    <QTabla
                        metaTabla={metaTablaRegistros}
                        datos={resultado.recibidas}
                        cargando={cargandoPreview}
                        orden={["baseimponible", "DESC"]}
                        totalEntidades={resultado.recibidas.length}
                    />
                </section>
            )}

            {datosBd && (
                <section>
                    <h3>Registros en BD ({datosBd.length})</h3>
                    <QTabla
                        metaTabla={metaTablaRegistros}
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
