import { useCallback, useState } from "react";
import { useEsMovil } from "./useEsMovil.ts";

export type Layout = "TARJETA" | "TABLA";

export function useLayout(defecto: Layout = "TARJETA"): {
    layout: Layout;
    cambiarLayout: () => void;
    esMovil: boolean;
} {
    const [layout, setLayout] = useState<Layout>(defecto);
    const esMovil = useEsMovil();

    const layoutEfectivo: Layout = esMovil ? "TARJETA" : layout;

    const cambiarLayout = useCallback(
        () => setLayout((l) => (l === "TARJETA" ? "TABLA" : "TARJETA")),
        []
    );

    return { layout: layoutEfectivo, cambiarLayout, esMovil };
}
