import { MaestroFiscal } from "../comun/maestro/MaestroFiscal.tsx";
import { configSerie } from "./dominio.ts";

/** Fiscalidad > Series (series.mtd / series.ui). */
export const MaestroSeries = () => <MaestroFiscal config={configSerie} />;
