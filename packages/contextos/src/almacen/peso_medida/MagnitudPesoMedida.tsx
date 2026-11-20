import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { ComponentProps } from "react";
import { MAGNITUDES } from "./diseño.ts";

const opciones = MAGNITUDES.map((m) => ({ valor: m, descripcion: m }));

export const MagnitudPesoMedida = (props: Omit<ComponentProps<typeof QSelect>, "opciones" | "label">) => (
    <QSelect label="Magnitud" opciones={opciones} {...props} />
);
