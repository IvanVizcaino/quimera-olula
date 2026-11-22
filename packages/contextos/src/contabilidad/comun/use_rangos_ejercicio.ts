import { Modelo } from "@olula/lib/diseño.ts";
import { useEffect, useRef, useState } from "react";
import { aBooleano } from "./checks_informe.ts";
import {
    getExtremosAsientos,
    getExtremosSubcuentas,
} from "./infraestructura_rangos.ts";
import {
    Extremos,
    ExtremosEjercicio,
    rangosSincronizados,
    SIN_EXTREMOS,
} from "./rangos_ejercicio.ts";

const sinError = (promesa: Promise<Extremos | null>) =>
    promesa.catch(() => null);

const subcuentasMarcadas = (modelo: Modelo): boolean | null =>
    "todasSubcuentas" in modelo ? aBooleano(modelo.todasSubcuentas) : null;

/**
 * «Todos los asientos» / «Todas las subcuentas» de los libros diario y
 * mayor (ver `rangos_ejercicio.ts`).
 *
 * Carga el primer y el último asiento/subcuenta del ejercicio del formulario
 * (de nuevo al cambiar de ejercicio) y, cada vez que llegan o que cambia una
 * de las casillas, deja los rangos como los deja Eneboo llamando a `set`.
 */
export const useRangosEjercicio = <T extends Modelo>(
    modelo: T,
    set: (modelo: T) => void,
    { asientos = false, subcuentas = false }: {
        asientos?: boolean;
        subcuentas?: boolean;
    }
): ExtremosEjercicio => {
    const [extremos, setExtremos] = useState<ExtremosEjercicio>(SIN_EXTREMOS);
    const ejercicioId = String(modelo.ejercicioId ?? "").trim();

    useEffect(() => {
        if (!ejercicioId) {
            setExtremos(SIN_EXTREMOS);
            return;
        }
        let vigente = true;
        const cargar = async () => {
            const [extremosAsientos, extremosSubcuentas] = await Promise.all([
                asientos
                    ? sinError(getExtremosAsientos(ejercicioId))
                    : Promise.resolve(null),
                subcuentas
                    ? sinError(getExtremosSubcuentas(ejercicioId))
                    : Promise.resolve(null),
            ]);
            if (vigente)
                setExtremos({
                    asientos: extremosAsientos,
                    subcuentas: extremosSubcuentas,
                });
        };
        void cargar();
        return () => {
            vigente = false;
        };
    }, [ejercicioId, asientos, subcuentas]);

    // El ajuste se hace con el modelo del momento, pero solo cuando cambian
    // las casillas o los extremos, no con cada tecla.
    const ultimo = useRef({ modelo, set });
    useEffect(() => {
        ultimo.current = { modelo, set };
    });

    const todosAsientos = aBooleano(modelo.todosAsientos);
    const todasSubcuentas = subcuentasMarcadas(modelo);
    const subcuentasPrevias = useRef(todasSubcuentas);

    useEffect(() => {
        const { modelo: actual, set: fijar } = ultimo.current;
        const ajustado = rangosSincronizados(
            actual,
            subcuentasPrevias.current,
            extremos
        );
        subcuentasPrevias.current = todasSubcuentas;
        if (ajustado !== actual) fijar(ajustado);
    }, [extremos, todosAsientos, todasSubcuentas]);

    return extremos;
};
