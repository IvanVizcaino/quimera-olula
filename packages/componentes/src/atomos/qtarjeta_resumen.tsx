import { QIcono } from "./qicono.tsx";
import "./qtarjeta_resumen.css";

type QTarjetaResumenProps = {
    titulo: string;
    valor: string;
    icono?: string;
    comparacion?: { valor: string; positivo: boolean } | null;
    /** Texto pequeño bajo el valor (p. ej. "Suma de total"). */
    pie?: string;
    cargando?: boolean;
    /** Explicación cuando el valor no está disponible (se muestra al pasar el ratón). */
    aviso?: string;
};

export const QTarjetaResumen = ({
    titulo,
    valor,
    icono,
    comparacion,
    pie,
    cargando,
    aviso,
}: QTarjetaResumenProps) => {
    return (
        <quimera-tarjeta-resumen data-cargando={cargando || undefined} title={aviso}>
            <div className="cabecera">
                <span className="titulo">{titulo}</span>
                {icono && <QIcono nombre={icono} tamaño="sm" color="var(--gris-6)" />}
            </div>
            <span className="valor">{valor}</span>
            {comparacion && (
                <span className="comparacion" data-positivo={comparacion.positivo}>
                    <QIcono
                        nombre={comparacion.positivo ? "arriba" : "abajo"}
                        tamaño="xs"
                    />
                    {comparacion.valor}
                </span>
            )}
            {pie && <span className="pie">{pie}</span>}
        </quimera-tarjeta-resumen>
    );
};
