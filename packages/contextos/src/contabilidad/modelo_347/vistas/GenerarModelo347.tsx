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
    CLAVES_TOTALES_MODELO_347,
    ETIQUETA_TOTAL_MODELO_347,
    nombreFicheroExportAeatModelo347,
    nombreFicheroListado347,
    parseModelo347Id,
} from "../dominio.ts";
import {
    ClaveListado347,
    Declarado347,
    DiffTotalModelo347,
    ResultadoGeneracionModelo347,
} from "../diseño.ts";
import {
    getDatosModelo347,
    getExportAeatModelo347,
    getGeneracionModelo347,
    getListadoModelo347,
    patchGenerarModelo347,
} from "../infraestructura.ts";
import { InmueblesModelo347 } from "./InmueblesModelo347.tsx";
import "#/comun/estilos/pagina_proceso.css";

const metaTablaDiffs: MetaTabla<DiffTotalModelo347> = [
    { id: "clave", cabecera: "Campo" },
    { id: "almacenado", cabecera: "En BD", tipo: "moneda" },
    { id: "calculado", cabecera: "Calculado", tipo: "moneda" },
    { id: "delta", cabecera: "Δ", tipo: "moneda" },
];

const metaTablaDeclarados: MetaTabla<Declarado347> = [
    { id: "nifdeclarado", cabecera: "NIF" },
    { id: "apellidosnombrers", cabecera: "Nombre / razón social" },
    { id: "clavecodigo", cabecera: "Clave" },
    { id: "codclienteprov", cabecera: "Tercero" },
    { id: "codpostal", cabecera: "CP" },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
    { id: "importet1", cabecera: "T1", tipo: "moneda" },
    { id: "importet2", cabecera: "T2", tipo: "moneda" },
    { id: "importet3", cabecera: "T3", tipo: "moneda" },
    { id: "importet4", cabecera: "T4", tipo: "moneda" },
    { id: "importemetalico", cabecera: "Metálico", tipo: "moneda" },
];

export const GenerarModelo347 = () => {
    const { intentar } = useContext(ContextoError);
    const [searchParams, setSearchParams] = useSearchParams();
    const idParam = searchParams.get("id") ?? "";

    const [modeloIdTexto, setModeloIdTexto] = useState(idParam);
    const [resultado, setResultado] = useState<ResultadoGeneracionModelo347 | null>(null);
    const [datosBd, setDatosBd] = useState<Declarado347[] | null>(null);
    const [cargandoPreview, setCargandoPreview] = useState(false);
    const [cargandoPersistir, setCargandoPersistir] = useState(false);
    const [cargandoDatos, setCargandoDatos] = useState(false);
    const [cargandoExportAeat, setCargandoExportAeat] = useState(false);
    const [cargandoListado, setCargandoListado] = useState(false);

    const pluginOk = pluginActivo("modelo_347");
    const modeloId = useMemo(() => parseModelo347Id(modeloIdTexto), [modeloIdTexto]);

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
            const datos = await intentar(() => getGeneracionModelo347(modeloId));
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
            await intentar(() => patchGenerarModelo347(modeloId));
            const datos = await intentar(() => getGeneracionModelo347(modeloId));
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
            const filas = await intentar(() => getDatosModelo347(modeloId));
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
            let anio = resultado?.anio ?? "";
            if (!anio.trim()) {
                const gen = await intentar(() => getGeneracionModelo347(modeloId));
                anio = gen.anio;
            }
            const blob = await intentar(() => getExportAeatModelo347(modeloId));
            await descargarDocumento(blob, nombreFicheroExportAeatModelo347(anio, modeloId));
        } finally {
            setCargandoExportAeat(false);
        }
    }, [
        cargandoExportAeat,
        cargandoPersistir,
        cargandoPreview,
        intentar,
        modeloId,
        resultado?.anio,
    ]);

    const descargarListado = useCallback(
        async (clave: ClaveListado347) => {
            if (!modeloId || cargandoListado || cargandoPreview || cargandoPersistir) return;
            setCargandoListado(true);
            try {
                const blob = await intentar(() => getListadoModelo347(modeloId, clave));
                await descargarDocumento(blob, nombreFicheroListado347(clave, modeloId));
            } finally {
                setCargandoListado(false);
            }
        },
        [cargandoListado, cargandoPersistir, cargandoPreview, intentar, modeloId]
    );

    const totalesPreview = resultado
        ? {
              totalentidades: resultado.totalentidades,
              importetotal: resultado.importetotal,
              totalinmuebles: resultado.totalinmuebles,
              totalarrendamiento: resultado.totalarrendamiento,
          }
        : null;

    const ocupado =
        cargandoPreview ||
        cargandoPersistir ||
        cargandoDatos ||
        cargandoExportAeat ||
        cargandoListado;

    return (
        <div className="InformeContable GenerarModelo347">
            <h2>Modelo 347 — generación</h2>

            {!pluginOk && (
                <p className="aviso aviso-advertencia" role="status">
                    El plugin <strong>modelo_347</strong> no está activo en esta instalación. La API puede
                    devolver error.
                </p>
            )}

            <p className="aviso aviso-info" role="status">
                Introduce el <strong>id</strong> de <code>co_modelo347</code> (p. ej. 16). También puedes abrir{" "}
                <code>/contabilidad/modelo_347?id=16</code>.
            </p>

            <div className="filtros-informe">
                <QInput
                    label="Id modelo 347"
                    nombre="modelo347_id"
                    valor={modeloIdTexto}
                    onChange={setModeloIdTexto}
                    tipo="entero"
                />
            </div>

            <div className="maestro-botones">
                <QBoton onClick={cargarPreview} deshabilitado={!modeloId || ocupado}>
                    {cargandoPreview ? "Calculando…" : "Calcular (preview)"}
                </QBoton>
                <QBoton
                    onClick={persistir}
                    deshabilitado={!modeloId || !resultado || ocupado}
                >
                    {cargandoPersistir ? "Persistiendo…" : "Persistir declarados calculados"}
                </QBoton>
                <QBoton onClick={cargarDatosBd} deshabilitado={!modeloId || ocupado}>
                    {cargandoDatos ? "Cargando…" : "Listar datos en BD"}
                </QBoton>
                <QBoton variante="borde" onClick={descargarAeat} deshabilitado={!modeloId || ocupado}>
                    {cargandoExportAeat ? "Descargando…" : "Descargar AEAT (.347)"}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={() => void descargarListado("clientes")}
                    deshabilitado={!modeloId || ocupado}
                >
                    {cargandoListado ? "PDF…" : "Listado PDF clientes"}
                </QBoton>
                <QBoton
                    variante="borde"
                    onClick={() => void descargarListado("proveedores")}
                    deshabilitado={!modeloId || ocupado}
                >
                    {cargandoListado ? "PDF…" : "Listado PDF proveedores"}
                </QBoton>
            </div>

            {resultado && (
                <section className="informe-cabecera">
                    <p>
                        Modelo <strong>{resultado.modeloId}</strong> · Año <strong>{resultado.anio}</strong> ·
                        Origen <strong>{resultado.origen || "—"}</strong>
                    </p>
                    <p>
                        Estado:{" "}
                        {resultado.coincide ? (
                            <strong className="texto-ok">Coincide con la BD</strong>
                        ) : (
                            <strong className="texto-advertencia">
                                Hay diferencias (totales: {resultado.diffsTotales.length}, declarados:{" "}
                                {resultado.diffsDeclarados.length})
                            </strong>
                        )}
                    </p>
                </section>
            )}

            {totalesPreview && (
                <section className="modelo347-totales">
                    <h3>Totales (calculados en preview)</h3>
                    <table className="qtabla-resumen">
                        <tbody>
                            {CLAVES_TOTALES_MODELO_347.map((clave) => (
                                <tr key={clave}>
                                    <th scope="row">{ETIQUETA_TOTAL_MODELO_347[clave]}</th>
                                    <td>
                                        {clave === "totalentidades" || clave === "totalinmuebles"
                                            ? totalesPreview[clave]
                                            : formatearMoneda(totalesPreview[clave], "EUR")}
                                    </td>
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

            {resultado && resultado.diffsDeclarados.length > 0 && (
                <section>
                    <h3>Diferencias en declarados (resumen)</h3>
                    <pre className="modelo347-diffs-declarados">
                        {JSON.stringify(resultado.diffsDeclarados, null, 2)}
                    </pre>
                </section>
            )}

            {resultado && resultado.declarados.length > 0 && (
                <section>
                    <h3>Declarados calculados (preview, con CP CC-16)</h3>
                    <QTabla
                        metaTabla={metaTablaDeclarados}
                        datos={resultado.declarados}
                        cargando={cargandoPreview}
                        orden={["importe", "DESC"]}
                        totalEntidades={resultado.declarados.length}
                    />
                </section>
            )}

            {datosBd && (
                <section>
                    <h3>Declarados en BD ({datosBd.length})</h3>
                    <QTabla
                        metaTabla={metaTablaDeclarados}
                        datos={datosBd}
                        cargando={cargandoDatos}
                        orden={["importe", "DESC"]}
                        totalEntidades={datosBd.length}
                    />
                </section>
            )}

            <InmueblesModelo347 modeloId={modeloId} ocupadoExterno={ocupado} />
        </div>
    );
};
