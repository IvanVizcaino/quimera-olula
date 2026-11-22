import { EventoCola } from "./diseño.ts";

export const ESTADOS_EVENTO_COLA = ["Pendiente", "En curso", "Ok", "Error", "Dead"];

/** Como el escritorio (flmastercolas.qs): sólo se reinicia lo que ha fallado. */
export const puedeReiniciarse = (evento: Pick<EventoCola, "estado">): boolean =>
    evento.estado === "Error" || evento.estado === "Dead";

const dos = (n: number) => String(n).padStart(2, "0");

/** «dd/mm/aaaa - hh:mm:ss», como flcolas.qs (muestraValoresFormateados). Las
 * marcas con zona horaria (+00:00, +01:00, Z) se pasan a la hora local; las que
 * no la llevan se muestran tal cual. */
export const formatearMarcaTiempo = (valor: string | null | undefined): string => {
    if (!valor) return "";
    if (/(Z|[+-]\d{2}:?\d{2})$/.test(valor)) {
        const d = new Date(valor);
        if (!isNaN(d.getTime())) {
            return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()} - ` +
                `${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;
        }
    }
    const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})/.exec(valor);
    return m ? `${m[3]}/${m[2]}/${m[1]} - ${m[4]}:${m[5]}:${m[6]}` : valor;
};

export const varianteEstadoEvento = (estado: string): "exito" | "error" | "advertencia" | "primario" | "neutro" => {
    switch (estado) {
        case "Ok": return "exito";
        case "Dead": return "error";
        case "Error": return "advertencia";
        case "En curso": return "primario";
        default: return "neutro";
    }
};
