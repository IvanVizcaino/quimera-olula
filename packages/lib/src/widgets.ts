import { ComponentType } from "react";
import type { RequisitoPlugin } from "./plugins.tsx";

export interface DefinicionWidget {
    id: string;
    regla?: string;
    /** Si se indica, el widget solo se muestra con ese plugin activo. */
    plugin?: RequisitoPlugin;
    Componente: ComponentType;
}

export type WidgetContextFactory = { widgets?: DefinicionWidget[] };

export const crearWidgets = (
    factory: Record<string, WidgetContextFactory>
): DefinicionWidget[] => {
    const factorias = Object.values(factory);

    return factorias
        .map((v) => (v as WidgetContextFactory)?.widgets)
        .filter(Boolean)
        .flat() as DefinicionWidget[];
};