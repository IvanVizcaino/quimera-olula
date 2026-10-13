import { Inventario } from "../../diseño.ts";

export const TabGeneralInventario = ({ inventario }: { inventario: Inventario }) => (
    <quimera-formulario>
        <dl className="datos-inventario">
            <dt>Código</dt>
            <dd>{inventario.id}</dd>
            <dt>Almacén</dt>
            <dd>{inventario.almacenId}</dd>
            <dt>Fecha</dt>
            <dd>{inventario.fecha.toLocaleDateString("es-ES")}</dd>
            <dt>Observaciones</dt>
            <dd>{inventario.observaciones || "—"}</dd>
            <dt>Estado</dt>
            <dd>{inventario.cerrado ? "Cerrado" : "Abierto"}</dd>
        </dl>
    </quimera-formulario>
);
