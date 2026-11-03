import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { NumeroTrimestre, Periodo } from "../diseño.ts";
import { rangoPeriodo } from "../dominio.ts";
import "./SelectorPeriodo.css";

type SelectorPeriodoProps = {
    periodo: Periodo;
    onChange: (periodo: Periodo) => void;
    soloTrimestres?: boolean;
    años?: number[];
};

const NUMEROS: NumeroTrimestre[] = [1, 2, 3, 4];

const añosPorDefecto = () => {
    const actual = new Date().getFullYear();
    return [actual, actual - 1, actual - 2];
};

export const SelectorPeriodo = ({
    periodo,
    onChange,
    soloTrimestres = false,
    años = añosPorDefecto(),
}: SelectorPeriodoProps) => {
    const rango = rangoPeriodo(periodo);
    const año =
        periodo.tipo === "trimestres"
            ? (periodo.trimestres[0]?.año ?? años[0])
            : Number((rango?.desde ?? "").slice(0, 4)) || años[0];
    const marcados = periodo.tipo === "trimestres" ? periodo.trimestres.map((t) => t.numero) : [];

    const cambiarTrimestre = (numero: NumeroTrimestre, marcado: boolean) => {
        const numeros = marcado ? [...marcados, numero] : marcados.filter((n) => n !== numero);
        onChange({
            tipo: "trimestres",
            trimestres: [...numeros].sort().map((n) => ({ año, numero: n })),
        });
    };

    const cambiarAño = (nuevo: number) =>
        onChange({
            tipo: "trimestres",
            trimestres: (marcados.length ? marcados : [1 as NumeroTrimestre]).map((numero) => ({ año: nuevo, numero })),
        });

    const cambiarModo = (fechas: boolean) =>
        onChange(
            fechas
                ? { tipo: "fechas", desde: rango?.desde ?? "", hasta: rango?.hasta ?? "" }
                : { tipo: "trimestres", trimestres: [{ año, numero: 1 }] }
        );

    return (
        <div className="SelectorPeriodo">
            {!soloTrimestres && (
                <QCheckbox
                    label="Fechas concretas"
                    nombre="periodo_fechas"
                    valor={periodo.tipo === "fechas"}
                    onChange={(valor) => cambiarModo(valor === "true")}
                />
            )}
            {periodo.tipo === "fechas" ? (
                <div className="fechas">
                    <QDate
                        label="Desde"
                        nombre="periodo_desde"
                        valor={periodo.desde}
                        onChange={(desde) => onChange({ ...periodo, desde })}
                    />
                    <QDate
                        label="Hasta"
                        nombre="periodo_hasta"
                        valor={periodo.hasta}
                        onChange={(hasta) => onChange({ ...periodo, hasta })}
                    />
                </div>
            ) : (
                <div className="trimestres">
                    <QSelect
                        label="Año"
                        nombre="periodo_año"
                        valor={String(año)}
                        opciones={años.map((a) => ({ valor: String(a), descripcion: String(a) }))}
                        onChange={(opcion) => opcion && cambiarAño(Number(opcion.valor))}
                    />
                    {NUMEROS.map((numero) => (
                        <QCheckbox
                            key={numero}
                            label={`T${numero}`}
                            nombre={`periodo_t${numero}`}
                            valor={marcados.includes(numero)}
                            onChange={(valor) => cambiarTrimestre(numero, valor === "true")}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
