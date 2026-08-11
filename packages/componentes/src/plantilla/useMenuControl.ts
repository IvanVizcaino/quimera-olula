import { useContext } from "react";
import { MenuContext } from "./menu_context";

export const useMenuControl = () => {
    const context = useContext(MenuContext);

    if (!context) {
        throw new Error(
            "useMenuControl debe ser usado dentro de un MenuProvider"
        );
    }

    return context;
};
