import { useEffect, useMemo, useState } from "react";
import { Catalogo, Periodicidad } from "../../saas_suscripcion/diseño.ts";
import { planPorDefecto } from "../../saas_suscripcion/dominio.ts";
import { SeleccionPlanRegistro } from "../diseño.ts";
import { getPlanesPublicos } from "../infraestructura.ts";

export interface PlanRegistro {
    /** null mientras carga o si los planes no se han podido cargar. */
    catalogo: Catalogo | null;
    cargando: boolean;
    error: boolean;
    planId: string;
    periodicidad: Periodicidad;
    setPlanId: (id: string) => void;
    setPeriodicidad: (p: Periodicidad) => void;
    /** Lo que se envía al registro; null sin plan (el backend asigna Pro con su prueba). */
    seleccion: SeleccionPlanRegistro | null;
}

/** Carga el catálogo público y mantiene el plan y la periodicidad elegidos, para compartirlos entre vistas. */
export const usePlanRegistro = (): PlanRegistro => {
    const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [planId, setPlanId] = useState("");
    const [periodicidad, setPeriodicidad] = useState<Periodicidad>("mensual");

    useEffect(() => {
        let vigente = true;
        getPlanesPublicos()
            .then((c) => {
                if (!vigente) return;
                setCatalogo(c);
                // Solo fija el plan por defecto si nadie ha elegido uno antes de que llegue el catálogo.
                setPlanId((actual) => actual || (planPorDefecto(c.planes)?.id ?? ""));
            })
            .catch(() => vigente && setError(true))
            .finally(() => vigente && setCargando(false));
        return () => { vigente = false; };
    }, []);

    const seleccion = useMemo(
        () => (planId ? { planId, periodicidad } : null),
        [planId, periodicidad],
    );

    return { catalogo, cargando, error, planId, periodicidad, setPlanId, setPeriodicidad, seleccion };
};
