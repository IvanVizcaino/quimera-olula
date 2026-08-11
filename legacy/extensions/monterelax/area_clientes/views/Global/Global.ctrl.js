import { setLineasCarrito } from "@olula/lib/carritoLineas.ts";
import { applyBunch } from "quimera/lib";

export const bunch = parent =>
    applyBunch(
        {
            setCarrito: [
                {
                    type: "function",
                    function: payload => {
                        setLineasCarrito(payload.carrito?.lineas ?? []);
                    },
                },
            ],
        },
        parent,
    );
