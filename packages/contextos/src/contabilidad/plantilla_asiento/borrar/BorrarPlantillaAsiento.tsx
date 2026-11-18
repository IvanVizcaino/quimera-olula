import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { PlantillaAsiento } from "../diseño.ts";
import { deletePlantillaAsiento } from "../infraestructura.ts";

export const BorrarPlantillaAsiento = ({
    publicar,
    plantilla,
}: {
    plantilla: PlantillaAsiento;
    publicar: EmitirEvento;
}) => {
    const borrar_ = useCallback(async () => {
        await deletePlantillaAsiento(plantilla.id);
        publicar("plantilla_borrada", plantilla);
    }, [publicar, plantilla]);

    const cancelar_ = useCallback(() => publicar("borrado_cancelado"), [publicar]);

    const [borrar, cancelar] = useForm(borrar_, cancelar_);

    return (
        <QModalConfirmacion
            nombre="borrarPlantillaAsiento"
            abierto={true}
            titulo="Borrar plantilla de asiento"
            mensaje={`¿Está seguro de que desea borrar la plantilla ${plantilla.id} y sus partidas?`}
            onCerrar={cancelar}
            onAceptar={borrar}
        />
    );
};
