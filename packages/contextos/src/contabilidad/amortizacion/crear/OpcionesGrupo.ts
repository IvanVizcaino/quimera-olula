import { getGruposContablesAmortizacion } from "#/contabilidad/grupo_contable_amortizacion/infraestructura.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";

export type OpcionGrupo = { valor: string; descripcion: string };

/** Grupos contables de amortización para el selector de la ficha. */
export const useOpcionesGrupo = (): OpcionGrupo[] => {
    const [opciones, setOpciones] = useState<OpcionGrupo[]>([]);
    useEffect(() => {
        let vivo = true;
        getGruposContablesAmortizacion({
            ...criteriaDefecto,
            filtro: [],
            orden: ["id", "ASC"],
            paginacion: { limite: 1000, pagina: 1 },
        }).then(({ datos }) => {
            if (vivo) {
                setOpciones(datos.map((g) => ({
                    valor: g.id,
                    descripcion: g.descripcion ? `${g.id} — ${g.descripcion}` : g.id,
                })));
            }
        }).catch(() => undefined);
        return () => { vivo = false; };
    }, []);
    return opciones;
};
