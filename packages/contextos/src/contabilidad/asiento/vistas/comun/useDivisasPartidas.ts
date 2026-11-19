import { getDivisasMaestro } from "#/comun/divisa/infraestructura.ts";
import { getEjercicio } from "#/contabilidad/ejercicio/infraestructura.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { DivisaConTasa } from "../../divisa_partida.ts";

/** Divisa de la empresa del ejercicio (la de las partidas por defecto) y las
 * divisas con su tasa de conversión (tabla divisas). */
export const useDivisasPartidas = (ejercicioId: string) => {
    const [divisaEmpresa, setDivisaEmpresa] = useState("");
    const [divisas, setDivisas] = useState<DivisaConTasa[]>([]);

    useEffect(() => {
        let vigente = true;
        if (ejercicioId) {
            getEjercicio(ejercicioId)
                .then((e) => { if (vigente) setDivisaEmpresa(e.divisaId ?? ""); })
                .catch(() => undefined);
        }
        return () => { vigente = false; };
    }, [ejercicioId]);

    useEffect(() => {
        let vigente = true;
        getDivisasMaestro({ ...criteriaDefecto, orden: ["id", "ASC"], paginacion: { pagina: 1, limite: 500 } })
            .then((r) => {
                if (vigente) setDivisas(r.datos.map((d) => ({
                    id: d.id, descripcion: d.descripcion || d.id, tasa: Number(d.tasaConversion) || 1,
                })));
            })
            .catch(() => undefined);
        return () => { vigente = false; };
    }, []);

    return { divisaEmpresa, divisas };
};
