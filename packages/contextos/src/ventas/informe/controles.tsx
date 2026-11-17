import { PropsControlInforme } from "#/comun/informe_documentos/diseño.ts";
import { Agente } from "../comun/componentes/agente.tsx";
import { Cliente } from "../comun/componentes/cliente.tsx";

/** Selectores de cliente y agente para los criterios de los informes. */
export const ControlCliente = ({ label, valor, nombre, onChange, deshabilitado, soloLectura }: PropsControlInforme) => (
    <Cliente
        label={label}
        valor={valor}
        nombre={nombre}
        deshabilitado={deshabilitado || soloLectura}
        opcional
        onChange={(opcion) => onChange(opcion)}
    />
);

export const ControlAgente = ({ label, valor, nombre, onChange, deshabilitado, soloLectura }: PropsControlInforme) => (
    <Agente
        label={label}
        valor={valor}
        nombre={nombre}
        deshabilitado={deshabilitado || soloLectura}
        opcional
        onChange={(opcion) => onChange(opcion)}
    />
);
