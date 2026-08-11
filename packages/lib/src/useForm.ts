import { useCallback, useContext, useState } from "react";
import { ContextoError } from "./contexto.ts";

type FuncionesForm = [
    aceptar: () => void,
    cancelar: () => void
]

export function useForm(
    aceptar_: () => void,
    cancelar_: () => void
): FuncionesForm {

    const { intentar } = useContext(ContextoError);

    const [aceptando, setAceptando] = useState(false);

    const aceptar = useCallback(
        async () => {
            setAceptando(true);
            await intentar(
                () => aceptar_(),
                () => setAceptando(false)
            );
        },
        [aceptar_, intentar, setAceptando]
    );

    const cancelar = useCallback(
        () => {
            if (!aceptando) {
                cancelar_();
            }
        },
        [aceptando, cancelar_]
    );

    return [aceptar, cancelar];
}
