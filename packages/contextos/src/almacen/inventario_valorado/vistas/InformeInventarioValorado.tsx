import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QTabla, MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { formatearMoneda } from "@olula/lib/dominio.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { LineaInventarioValorado, TotalesInventarioValorado } from "../diseño.ts";
import { criteriaInventarioValorado, nombreFicheroPdfInventarioValorado } from "../dominio.ts";
import { getInventarioValorado, getReportInventarioValorado } from "../infraestructura.ts";
import "#/comun/estilos/pagina_proceso.css";

const metaTabla: MetaTabla<LineaInventarioValorado> = [
    { id: "almacenId", cabecera: "Almacén" },
    { id: "almacenNombre", cabecera: "Nombre almacén" },
    { id: "referencia", cabecera: "Referencia" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "cantidad", cabecera: "Cantidad" },
    { id: "precioUnitario", cabecera: "Precio unit.", tipo: "moneda" },
    { id: "valor", cabecera: "Valor", tipo: "moneda" },
    { id: "tipoValoracion", cabecera: "Valoración" },
];

export const InformeInventarioValorado = () => {
    const { intentar } = useContext(ContextoError);
    const [almacenId, setAlmacenId] = useState("");
    const [referencia, setReferencia] = useState("");
    const [filas, setFilas] = useState<LineaInventarioValorado[]>([]);
    const [totales, setTotales] = useState<TotalesInventarioValorado | null>(null);
    const [total, setTotal] = useState(0);
    const [cargando, setCargando] = useState(false);
    const [descargando, setDescargando] = useState(false);

    const criteria = useMemo(
        () =>
            criteriaInventarioValorado({
                almacenId,
                referencia,
            }),
        [almacenId, referencia]
    );

    const consultar = useCallback(async () => {
        if (cargando) return;

        setCargando(true);
        try {
            const informe = await intentar(() => getInventarioValorado(criteria));
            setFilas(informe.lineas);
            setTotales(informe.totales);
            setTotal(informe.total);
        } finally {
            setCargando(false);
        }
    }, [cargando, criteria, intentar]);

    const descargarPdf = useCallback(async () => {
        if (descargando || cargando) return;

        setDescargando(true);
        try {
            const blob = await intentar(() => getReportInventarioValorado(criteria));
            await descargarDocumento(blob, nombreFicheroPdfInventarioValorado());
        } finally {
            setDescargando(false);
        }
    }, [cargando, criteria, descargando, intentar]);

    return (
        <div className="InformeAlmacen InformeInventarioValorado">
            <header className="pagina-proceso__cabecera">
                <h2>Inventario valorado</h2>
            </header>
            <section className="pagina-proceso__panel">
                <quimera-formulario className="filtros-informe-almacen">
                    <Almacen
                        nombre="almacen_id"
                        valor={almacenId}
                        opcional
                        onChange={(opcion) => setAlmacenId(opcion?.valor ?? "")}
                    />
                    <QInput
                        label="Referencia"
                        nombre="referencia"
                        valor={referencia}
                        onChange={setReferencia}
                        opcional
                    />
                </quimera-formulario>
                <div className="maestro-botones">
                    <QBoton onClick={consultar} deshabilitado={cargando}>
                        Consultar
                    </QBoton>
                    <QBoton
                        variante="borde"
                        onClick={descargarPdf}
                        deshabilitado={descargando || cargando}
                    >
                        {descargando ? "Descargando…" : "Descargar PDF"}
                    </QBoton>
                </div>
            </section>

            {totales && (
                <p className="informe-totales">
                    Total general: <strong>{formatearMoneda(totales.totalGeneral, "EUR")}</strong>
                    {Object.keys(totales.porAlmacen).length > 0 && (
                        <>
                            {" "}
                            · {total} líneas
                        </>
                    )}
                </p>
            )}

            {(filas.length > 0 || total > 0) && (
                <QTabla
                    metaTabla={metaTabla}
                    datos={filas}
                    cargando={cargando}
                    orden={["almacenId", "ASC"]}
                    totalEntidades={total}
                />
            )}
        </div>
    );
};
