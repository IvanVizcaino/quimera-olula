import { formatearFechaDate } from "@olula/lib/dominio.js";
import { IaFlujo } from "../diseño.js";

interface TabInformacionProps {
    iaFlujo: IaFlujo;
}

/**
 * Tab de solo lectura con los metadatos de auditoría del flujo.
 */
export const TabInformacion = ({ iaFlujo }: TabInformacionProps) => {
    return (
        <div className="TabInformacion">
            <dl>
                <dt>Estado</dt>
                <dd>{iaFlujo.activo ? "Activo" : "Inactivo"}</dd>
                <dt>Creado por</dt>
                <dd>{iaFlujo.creadoPor || "-"}</dd>
                <dt>Creado en</dt>
                <dd>{formatearFechaDate(iaFlujo.creadoEn)}</dd>
                <dt>Actualizado en</dt>
                <dd>{formatearFechaDate(iaFlujo.actualizadoEn)}</dd>
            </dl>
        </div>
    );
};
