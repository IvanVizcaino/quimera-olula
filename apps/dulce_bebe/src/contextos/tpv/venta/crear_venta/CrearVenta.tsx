import { AgenteTpv } from "#/tpv/comun/componentes/AgenteTpv.tsx";
import { postVenta } from "#/tpv/venta/infraestructura.ts";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";
import { useForm } from "@olula/lib/useForm.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";

interface NuevaVentaDulceBebe {
    [clave: string]: unknown;
    agenteId: string;
}

const metaNuevaVentaDulceBebe: MetaModelo<NuevaVentaDulceBebe> = {
    campos: {
        agenteId: { requerido: true },
    },
};

const nuevaVentaDulceBebeVacia: NuevaVentaDulceBebe = {
    agenteId: "",
};

export const CrearVentaDulceBebe = ({
    publicar,
}: {
    publicar: EmitirEvento;
}) => {
    const { modelo, set, valido } = useModelo(
        metaNuevaVentaDulceBebe,
        nuevaVentaDulceBebeVacia
    );

    const agenteId = modelo.agenteId as string;

    const crear_ = useCallback(async () => {
        const id = await postVenta(agenteId);
        publicar("venta_creada", id);
    }, [agenteId, publicar]);

    const cancelar_ = useCallback(
        () => publicar("alta_de_venta_cancelada"),
        [publicar]
    );

    const [crear, cancelar] = useForm(crear_, cancelar_);

    return (
        <QModal
            abierto={true}
            nombre="crear-venta-dulce-bebe"
            titulo="Nueva Venta"
            onCerrar={cancelar}
        >
            <quimera-formulario>
                <AgenteTpv
                    nombre="agente_tpv"
                    label="Agente"
                    valor={agenteId}
                    onChange={(opcion) =>
                        set({ ...modelo, agenteId: opcion?.valor ?? "" })
                    }
                />
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={crear} deshabilitado={!valido}>
                    Crear Venta
                </QBoton>
            </div>
        </QModal>
    );
};
