import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { useCallback, useContext, useMemo, useState } from "react";
import { InformePatrimonio as DatosPatrimonio } from "../../diseño.ts";
import { criteriaInformePeriodo, ejercicioActual } from "../../dominio.ts";
import { getInformePatrimonio } from "../../infraestructura.ts";
import { BotonDescargarPdfInforme } from "../comun/BotonDescargarPdfInforme.tsx";
import "#/comun/estilos/pagina_proceso.css";

const formato = (n: number) =>
    n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const InformePatrimonio = () => {
    const { intentar } = useContext(ContextoError);
    const [ejercicioId, setEjercicioId] = useState(ejercicioActual());
    const [ejercicioAnteriorId, setEjercicioAnteriorId] = useState(() => {
        const n = Number(ejercicioActual());
        return Number.isFinite(n) ? String(n - 1) : "";
    });
    const [informe, setInforme] = useState<DatosPatrimonio | null>(null);
    const [cargando, setCargando] = useState(false);

    const criteria = useMemo(
        () =>
            criteriaInformePeriodo({
                ejercicioId,
                ejercicioAnteriorId,
            }),
        [ejercicioId, ejercicioAnteriorId]
    );

    const consultar = useCallback(async () => {
        if (!ejercicioId.trim() || cargando) return;

        setCargando(true);
        try {
            const datos = await intentar(() => getInformePatrimonio(criteria));
            setInforme(datos);
        } finally {
            setCargando(false);
        }
    }, [cargando, criteria, ejercicioId, intentar]);

    return (
        <div className="InformeContable InformePatrimonio">
            <header className="pagina-proceso__cabecera">
                <h2>Estado de cambios en el patrimonio neto</h2>
            </header>
            <section className="pagina-proceso__panel">
                <quimera-formulario className="filtros-informe-contable">
                    <QInput
                        label="Ejercicio"
                        nombre="ejercicio_id"
                        valor={ejercicioId}
                        onChange={setEjercicioId}
                    />
                    <QInput
                        label="Ejercicio anterior"
                        nombre="ejercicio_anterior_id"
                        valor={ejercicioAnteriorId}
                        onChange={setEjercicioAnteriorId}
                        opcional
                    />
                </quimera-formulario>
                <div className="maestro-botones">
                    <QBoton onClick={consultar} deshabilitado={!ejercicioId.trim() || cargando}>
                        Consultar
                    </QBoton>
                    <BotonDescargarPdfInforme
                        tipo="patrimonio"
                        criteria={criteria}
                        deshabilitado={!ejercicioId.trim()}
                        ocupadoExterno={cargando}
                    />
                </div>
            </section>

            {informe && (
                <>
                    <p>{informe.titulo}</p>
                    <div style={{ overflowX: "auto" }}>
                        <table className="qtabla">
                            <thead>
                                <tr>
                                    <th></th>
                                    {informe.columnas.map((c) => (
                                        <th key={c}>{c}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {informe.datos.map((fila) => (
                                    <tr key={fila.id}>
                                        <td>{fila.etiqueta}</td>
                                        {fila.valores.map((v, i) => (
                                            <td key={i} style={{ textAlign: "right" }}>
                                                {formato(v)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};
