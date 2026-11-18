import { PropsControlInforme } from "#/comun/informe_documentos/diseño.ts";
import { Proveedor } from "../comun/componentes/proveedor.tsx";

/** Selector de proveedor para los criterios de los informes. */
export const ControlProveedor = ({ label, valor, nombre, onChange, deshabilitado, soloLectura }: PropsControlInforme) => (
    <Proveedor
        label={label}
        valor={valor}
        nombre={nombre}
        deshabilitado={deshabilitado || soloLectura}
        opcional
        onChange={(opcion) => onChange(opcion)}
    />
);
