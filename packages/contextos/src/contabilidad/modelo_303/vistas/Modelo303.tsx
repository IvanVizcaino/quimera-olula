import { useSearchParams } from "react-router";
import { parseModelo303Id } from "../dominio.ts";
import { GenerarModelo303 } from "./GenerarModelo303.tsx";
import { MaestroModelo303 } from "./maestro/MaestroModelo303.tsx";

/** Listado de periodos 303; con `?id=` abre la pantalla de generación. */
export const Modelo303 = () => {
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get("id") ?? "";
    const modeloId = parseModelo303Id(idParam);

    if (modeloId) return <GenerarModelo303 />;
    return <MaestroModelo303 />;
};
