import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import { GrupoIvaProducto } from "#/ventas/comun/componentes/grupo_iva_producto.tsx";
import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { formatearFechaDate, formatearMoneda } from "@olula/lib/dominio.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import {
    FilaLibroFacturasRecCcaja,
    LibroFacturasRecCcaja,
    OpcionesLibroRecc,
} from "../../diseño.ts";
import {
    criteriaLibroRecc,
    ejercicioActual,
    fechasEjercicioPorDefecto,
    opcionesLibroReccVacias,
    validarFiltrosLibroRecc,
} from "../../dominio.ts";
import { getInformeLibroFacturasRecCcaja } from "../../infraestructura.ts";
import { BotonDescargarPdfInforme } from "../comun/BotonDescargarPdfInforme.tsx";
import { FiltrosPeriodoInforme } from "../comun/FiltrosPeriodoInforme.tsx";
import "#/comun/estilos/pagina_proceso.css";

const textoRecibos = (f: FilaLibroFacturasRecCcaja): string =>
    f.recibos
        .map((r) =>
            [
                r.codigo ?? String(r.reciboId),
                r.formaPago ?? r.formaPagoId,
                r.fechaPago ? formatearFechaDate(r.fechaPago) : null,
                r.importe != null ? formatearMoneda(r.importe, "EUR") : null,
            ]
                .filter(Boolean)
                .join(" · ")
        )
        .join(" | ");

const metaTabla: MetaTabla<FilaLibroFacturasRecCcaja> = [
    { id: "fechaAsiento", cabecera: "Fecha asiento", tipo: "fecha" },
    { id: "asientoNumero", cabecera: "Asiento" },
    { id: "codigoSerie", cabecera: "Serie" },
    { id: "numeroFactura", cabecera: "Nº factura" },
    { id: "codigoFactura", cabecera: "Factura" },
    { id: "numeroFacturaProveedor", cabecera: "Fra. proveedor" },
    { id: "nombreProveedor", cabecera: "Proveedor" },
    { id: "cifNif", cabecera: "CIF/NIF" },
    { id: "baseImponible", cabecera: "Base", tipo: "moneda" },
    { id: "porcentajeIva", cabecera: "% IVA" },
    { id: "porcentajeRecargo", cabecera: "% rec." },
    { id: "cuotaIva", cabecera: "Cuota IVA", tipo: "moneda" },
    { id: "codGrupoIvaNeg", cabecera: "G.IVA neg." },
    { id: "documento", cabecera: "Documento" },
    {
        id: "criterioCaja",
        cabecera: "Criterio de caja",
        render: (f) => (f.criterioCaja ? "Sí" : ""),
    },
    { id: "recibos", cabecera: "Recibos pagados", render: textoRecibos },
];

export const InformeLibroFacturasRecCcaja = () => {
    const { intentar } = useContext(ContextoError);
    const [ejercicioId, setEjercicioId] = useState(ejercicioActual());
    const [fechaDesde, setFechaDesde] = useState(() => fechasEjercicioPorDefecto(ejercicioActual()).fechaDesde);
    const [fechaHasta, setFechaHasta] = useState(() => fechasEjercicioPorDefecto(ejercicioActual()).fechaHasta);
    const [opciones, setOpciones] = useState<OpcionesLibroRecc>(opcionesLibroReccVacias);
    const [libro, setLibro] = useState<LibroFacturasRecCcaja | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ultimoCriteria, setUltimoCriteria] = useState<ReturnType<typeof criteriaLibroRecc> | null>(null);

    const filtros = useMemo(
        () => ({ ejercicioId, fechaDesde, fechaHasta }),
        [ejercicioId, fechaDesde, fechaHasta]
    );

    const actualizar = (parcial: Partial<OpcionesLibroRecc>) => {
        setOpciones((prev) => ({ ...prev, ...parcial }));
        setError(null);
    };

    const cambiarEjercicio = (v: string) => {
        setEjercicioId(v);
        const f = fechasEjercicioPorDefecto(v);
        if (f.fechaDesde) {
            setFechaDesde(f.fechaDesde);
            setFechaHasta(f.fechaHasta);
        }
        setError(null);
    };

    const consultar = useCallback(async () => {
        if (cargando) return;
        const err = validarFiltrosLibroRecc(filtros);
        if (err) {
            setError(err);
            return;
        }
        const criteria = criteriaLibroRecc(filtros, opciones);
        setCargando(true);
        try {
            setLibro(await intentar(() => getInformeLibroFacturasRecCcaja(criteria)));
            setUltimoCriteria(criteria);
            setError(null);
        } finally {
            setCargando(false);
        }
    }, [cargando, filtros, intentar, opciones]);

    return (
        <div className="InformeContable InformeLibroFacturasRecCcaja">
            <h2>Libro IVA facturas recibidas (criterio de caja)</h2>
            <FiltrosPeriodoInforme
                ejercicioId={ejercicioId}
                fechaDesde={fechaDesde}
                fechaHasta={fechaHasta}
                onEjercicioId={cambiarEjercicio}
                onFechaDesde={setFechaDesde}
                onFechaHasta={setFechaHasta}
            />
            <quimera-formulario className="filtros-informe-contable">
                <QInput
                    label="Serie de facturación"
                    nombre="codigo_serie"
                    valor={opciones.codigoSerie}
                    onChange={(v) => actualizar({ codigoSerie: v })}
                    opcional
                />
                <GrupoIvaProducto
                    valor={opciones.codImpuesto}
                    nombre="cod_impuesto"
                    opcional
                    onChange={(o) => actualizar({ codImpuesto: o?.valor ?? "" })}
                />
                <GrupoIvaNegocio
                    valor={opciones.codGrupoIvaNeg}
                    nombre="cod_grupo_iva_neg"
                    label="G.IVA negocio"
                    onChange={(o) => actualizar({ codGrupoIvaNeg: o?.valor ?? "" })}
                />
                <QCheckbox
                    label="Agrupado G.Neg."
                    nombre="agrupar_iva_neg"
                    valor={opciones.agruparIvaNeg}
                    onChange={(v) => actualizar({ agruparIvaNeg: v === "true" })}
                />
                <QCheckbox
                    label="Numeración automática de facturas"
                    nombre="numeracion_auto"
                    valor={opciones.numeracionAuto}
                    onChange={(v) => actualizar({ numeracionAuto: v === "true" })}
                />
                <QInput
                    label="desde el nº"
                    nombre="num_desde"
                    tipo="entero"
                    valor={String(opciones.numDesde)}
                    deshabilitado={!opciones.numeracionAuto}
                    onChange={(v) => actualizar({ numDesde: Number.parseInt(v, 10) || 1 })}
                />
                <QCheckbox
                    label="Ignorar facturas sin I.V.A."
                    nombre="con_iva"
                    valor={opciones.conIva}
                    onChange={(v) => actualizar({ conIva: v === "true" })}
                />
            </quimera-formulario>

            {error && <QAviso variante="error">{error}</QAviso>}

            <div className="maestro-botones">
                <QBoton onClick={consultar} deshabilitado={!ejercicioId.trim() || cargando}>
                    Consultar
                </QBoton>
                <BotonDescargarPdfInforme
                    tipo="libro_facturas_recibidas_ccaja"
                    criteria={ultimoCriteria ?? criteriaLibroRecc(filtros, opciones)}
                    deshabilitado={!ultimoCriteria || cargando}
                />
            </div>

            {libro && (libro.datos.length > 0 || libro.total > 0) && (
                <>
                    <QTabla
                        metaTabla={metaTabla}
                        datos={libro.datos}
                        cargando={cargando}
                        orden={["fechaAsiento", "ASC"]}
                        totalEntidades={libro.total}
                    />
                    <p className="InformeLibroFacturasRecCcaja__totales">
                        Total base: <strong>{formatearMoneda(libro.totales.base, "EUR")}</strong> — Total
                        cuota: <strong>{formatearMoneda(libro.totales.cuota, "EUR")}</strong>
                    </p>
                </>
            )}

            {libro && libro.totalesGrupoIvaNeg.length > 0 && (
                <section>
                    <h3>Subtotales por grupo de negocio</h3>
                    <table className="InformeLibroFacturasRecCcaja__grupos">
                        <thead>
                            <tr>
                                <th>G.IVA negocio</th>
                                <th>Base</th>
                                <th>Cuota</th>
                                <th>Cuota reversión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {libro.totalesGrupoIvaNeg.map((g) => (
                                <tr key={g.codGrupoIvaNeg}>
                                    <td>{g.codGrupoIvaNeg}</td>
                                    <td>{formatearMoneda(g.base, "EUR")}</td>
                                    <td>{formatearMoneda(g.cuota, "EUR")}</td>
                                    <td>{formatearMoneda(g.cuotaReversion, "EUR")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}

            {libro && libro.resumenIva.length > 0 && (
                <section>
                    <h3>Resumen de I.V.A.</h3>
                    <table className="InformeLibroFacturasRecCcaja__resumen">
                        <thead>
                            <tr>
                                <th>Grupo - impuesto - % IVA - % rec.</th>
                                <th>Base</th>
                                <th>Cuota</th>
                                <th>Cuota reversión</th>
                            </tr>
                        </thead>
                        <tbody>
                            {libro.resumenIva.map((g) => (
                                <tr key={g.nombre}>
                                    <td>{g.nombre}</td>
                                    <td>{formatearMoneda(g.base, "EUR")}</td>
                                    <td>{formatearMoneda(g.cuota, "EUR")}</td>
                                    <td>{g.reversion ? formatearMoneda(g.cuotaReversion, "EUR") : ""}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}
        </div>
    );
};
