import { useState } from "react";
import { preferencias } from "./preferencias.ts";

export const usePreferencia = <T>(clave: string, porDefecto: T): [T, (v: T) => void] => {
    const [valor, setValor] = useState<T>(() => preferencias.get(clave, porDefecto));

    const actualizar = (nuevoValor: T) => {
        preferencias.set(clave, nuevoValor);
        setValor(nuevoValor);
    };

    return [valor, actualizar];
};
