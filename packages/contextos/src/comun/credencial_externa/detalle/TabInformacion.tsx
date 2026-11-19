import { formatearFechaDate } from "@olula/lib/dominio.js";
import { Empresa } from "../../componentes/empresa.js";
import { getConfiguracionCredenciales } from "../configuracion.js";
import { OPCIONES_TIPO_AUTH } from "../dominio.js";
import { CredencialExterna } from "../diseño.js";

interface TabInformacionProps {
    credencial: CredencialExterna;
}

/**
 * Tab de solo lectura con los metadatos de auditoría y el tipo de
 * autenticación (fijo desde la creación, ver dominio.ts).
 */
export const TabInformacion = ({ credencial }: TabInformacionProps) => {
    const tipoAuth = OPCIONES_TIPO_AUTH.find((o) => o.valor === credencial.tipoAuth)?.descripcion
        ?? credencial.tipoAuth;

    return (
        <div className="TabInformacion">
            <dl>
                {!getConfiguracionCredenciales().empresaFija && (
                    <>
                        <dt>Empresa</dt>
                        <dd><Empresa valor={credencial.empresaId} soloLectura /></dd>
                    </>
                )}
                <dt>Categoría</dt>
                <dd>{credencial.categoria === "llm" ? "Modelo de IA" : "Conector"}</dd>
                <dt>Tipo de autenticación</dt>
                <dd>{tipoAuth}</dd>
                <dt>Ámbito</dt>
                <dd>{credencial.propietarioId ? "Personal" : "Toda la empresa"}</dd>
                <dt>Estado</dt>
                <dd>{credencial.activo ? "Activa" : "Inactiva"}</dd>
                <dt>Creado por</dt>
                <dd>{credencial.creadoPor || "-"}</dd>
                <dt>Creado en</dt>
                <dd>{formatearFechaDate(credencial.creadoEn)}</dd>
                <dt>Actualizado en</dt>
                <dd>{formatearFechaDate(credencial.actualizadoEn)}</dd>
            </dl>
        </div>
    );
};
