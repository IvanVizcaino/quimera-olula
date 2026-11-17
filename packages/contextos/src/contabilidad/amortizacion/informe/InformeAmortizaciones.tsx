import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { descargarDocumento } from "@olula/lib/api/documentos.ts";
import { ContextoError } from "@olula/lib/contexto.ts";
import { MetaModelo, puede } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { useOpcionesGrupo } from "../crear/OpcionesGrupo.ts";
import { FiltroInforme, InformeAmortizaciones as Informe, ValoresInforme } from "../diseño.ts";
import { getInformeAmortizaciones, getReportAmortizaciones } from "../infraestructura.ts";

const metaFiltro: MetaModelo<FiltroInforme> = {
    campos: {
        ejercicioId: { requerido: true, maximo: 4 },
        grupoId: { requerido: false, tipo: "selector" },
        codigoCuenta: { requerido: false },
        amortizacionId: { requerido: false },
        descripcion: { requerido: false },
    },
};

const COLUMNAS: { campo: keyof ValoresInforme; cabecera: string }[] = [
    { campo: "costeInicio", cabecera: "Coste inicio" },
    { campo: "adicion", cabecera: "Adición período" },
    { campo: "venta", cabecera: "Venta/Baja período" },
    { campo: "costeFin", cabecera: "Coste fin" },
    { campo: "amortizacionInicio", cabecera: "Amortización inicio" },
    { campo: "amortizacionPeriodo", cabecera: "Amortización período" },
    { campo: "ventaAmortizacionPeriodo", cabecera: "Venta/Baja amort. per." },
    { campo: "amortizacionFin", cabecera: "Amortización fin" },
    { campo: "valorInicio", cabecera: "Valor neto inicio" },
    { campo: "valorFin", cabecera: "Valor neto fin" },
];

const importe = (valor: number): string =>
    valor.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const celdas = (valores: ValoresInforme) =>
    COLUMNAS.map(({ campo }) => <td key={campo} className="numero">{importe(valores[campo])}</td>);

/** Informe de amortizaciones (Eneboo `co_i_amortizaciones`): cuadro por
 * cuenta del elemento con coste, amortización y valor neto del ejercicio. */
export const InformeAmortizaciones = () => {
    const { intentar } = useContext(ContextoError);
    const inicial = useMemo((): FiltroInforme => ({
        ejercicioId: ejercicioActual(), grupoId: "", codigoCuenta: "", amortizacionId: "",
        descripcion: "",
    }), []);
    const { modelo, uiProps, valido } = useModelo(metaFiltro, inicial);
    const grupos = useOpcionesGrupo();
    const [informe, setInforme] = useState<Informe | null>(null);
    const [ocupado, setOcupado] = useState(false);

    const consultar = useCallback(async () => {
        setOcupado(true);
        try {
            setInforme(await intentar(() => getInformeAmortizaciones(modelo)));
        } finally {
            setOcupado(false);
        }
    }, [intentar, modelo]);

    const pdf = useCallback(async () => {
        setOcupado(true);
        try {
            const blob = await intentar(() => getReportAmortizaciones(modelo));
            await descargarDocumento(blob, `amortizaciones-${modelo.ejercicioId}.pdf`);
        } finally {
            setOcupado(false);
        }
    }, [intentar, modelo]);

    if (!puede("contabilidad.asiento")) {
        return <p>No tienes permiso para ver el informe de amortizaciones.</p>;
    }

    return (
        <div className="InformeAmortizaciones">
            <h2>Informe de amortizaciones</h2>
            <quimera-formulario>
                <QInput label="Ejercicio" {...uiProps("ejercicioId")} />
                <QSelect label="Grupo contable" opciones={[{ valor: "", descripcion: "(Todos)" }, ...grupos]}
                    {...uiProps("grupoId")} />
                <QInput label="Cuenta" {...uiProps("codigoCuenta")} />
                <QInput label="Amortización" {...uiProps("amortizacionId")} />
                <QInput label="Descripción del informe" {...uiProps("descripcion")} />
            </quimera-formulario>
            <div className="maestro-botones">
                <QBoton onClick={consultar} deshabilitado={!valido || ocupado}>Consultar</QBoton>
                <QBoton variante="borde" onClick={pdf} deshabilitado={!valido || ocupado}>
                    Descargar PDF
                </QBoton>
            </div>

            {informe && informe.cuentas.length === 0 && (
                <p>No hay amortizaciones para el ejercicio y los filtros indicados.</p>
            )}
            {informe && informe.cuentas.length > 0 && (
                <table className="tabla-informe-amortizaciones">
                    <thead>
                        <tr>
                            <th>Elemento</th>
                            {COLUMNAS.map((c) => <th key={c.campo}>{c.cabecera}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {informe.cuentas.map((cuenta) => [
                            <tr key={`c-${cuenta.codigoCuenta}`} className="cabecera-cuenta">
                                <td colSpan={COLUMNAS.length + 1}>
                                    <strong>{cuenta.codigoCuenta} {cuenta.descripcion}</strong>
                                </td>
                            </tr>,
                            ...cuenta.lineas.map((linea) => (
                                <tr key={`l-${linea.amortizacionId}`}>
                                    <td>{linea.amortizacionId} {linea.elemento}</td>
                                    {celdas(linea)}
                                </tr>
                            )),
                            <tr key={`t-${cuenta.codigoCuenta}`} className="total">
                                <td><strong>Total cuenta</strong></td>
                                {celdas(cuenta.total)}
                            </tr>,
                        ])}
                        <tr className="total">
                            <td><strong>TOTAL INFORME</strong></td>
                            {celdas(informe.total)}
                        </tr>
                    </tbody>
                </table>
            )}
        </div>
    );
};
