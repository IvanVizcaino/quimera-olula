import { MaestroFiscal } from "../comun/maestro/MaestroFiscal.tsx";
import { configImpuesto } from "./dominio.ts";

/** Fiscalidad > Impuestos (impuestos.mtd / impuestos.ui). */
export const MaestroImpuestos = () => <MaestroFiscal config={configImpuesto} />;
