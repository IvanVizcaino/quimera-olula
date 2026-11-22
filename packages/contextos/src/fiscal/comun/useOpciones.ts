import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { useEffect, useState } from "react";

export type Opcion = { valor: string; descripcion: string };

/** Opciones de un selector a partir de un maestro (id + descripción). */
export const useOpciones = (url: string): Opcion[] => {
    const [opciones, setOpciones] = useState<Opcion[]>([]);
    useEffect(() => {
        let vigente = true;
        RestAPI.get<{ datos: { id: string; descripcion: string | null }[] }>(url)
            .then((r) => {
                if (vigente) setOpciones(r.datos.map((d) => ({
                    valor: d.id, descripcion: d.descripcion ? `${d.id} — ${d.descripcion}` : d.id,
                })));
            })
            .catch(() => { if (vigente) setOpciones([]); });
        return () => { vigente = false; };
    }, [url]);
    return opciones;
};
