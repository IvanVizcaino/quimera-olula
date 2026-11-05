import { ComponentType } from "react";

export interface DefinicionWidget {
    id: string;
    regla?: string;
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