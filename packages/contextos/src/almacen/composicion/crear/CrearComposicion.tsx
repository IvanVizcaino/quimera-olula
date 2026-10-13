import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Articulo as ArticuloSelector } from "#/almacen/comun/componentes/Articulo.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Mostrar } from "@olula/componentes/moleculas/Mostrar.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { ProcesarEvento } from "@olula/lib/useMaquina.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { empresaActual } from "#/valores/empresaActual.ts";
import { getEmpresa } from "#/empresa/empresa/infraestructura.ts";
import { useContext, useEffect, useMemo, useState } from "react";
import { composicionNuevaVacia, metaNuevaComposicion } from "../dominio.ts";
import { getComposicion, postComposicion } from "../infraestructura.ts";

export const CrearComposicion = ({
    publicar = async () => {},
    activo = false,
}: {
    publicar?: ProcesarEvento;
    activo: boolean;
}) => {
    const { intentar } = useContext(ContextoError);
    const [almacenDefecto, setAlmacenDefecto] = useState("");
    const inicial = useMemo(() => composicionNuevaVacia(), []);
    const form = useModelo(metaNuevaComposicion, inicial);

    // Eneboo precarga el almacén por defecto de la empresa en el alta.
    useEffect(() => {
        const empresaId = empresaActual();
        if (!empresaId) return;
        let activo = true;
        getEmpresa(empresaId)
            .then((empresa) => {
                if (activo) setAlmacenDefecto(empresa.almacenId ?? "");
            })
            .catch(() => {});
        return () => {
            activo = false;
        };
    }, []);

    const { modelo, set } = form;
    useEffect(() => {
        if (almacenDefecto && !modelo.almacenId) set({ ...modelo, almacenId: almacenDefecto });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [almacenDefecto]);

    const crear = async () => {
        // El backend genera las líneas desde los componentes del kit (como «Generar composición»).
        const id = await intentar(() => postComposicion(form.modelo));
        const composicion = await getComposicion(id);
        publicar("composicion_creada", composicion);
        form.init(composicionNuevaVacia(almacenDefecto));
    };

    const cancelar = () => {
        form.init(composicionNuevaVacia(almacenDefecto));
        publicar("creacion_cancelada");
    };

    return (
        <Mostrar modo="modal" activo={activo} onCerrar={cancelar}>
            <div className="CrearComposicion">
                <h2>Nueva composición</h2>
                <quimera-formulario>
                    <ArticuloSelector
                        {...form.uiProps("articuloId")}
                        nombre="articuloId"
                    />
                    <Almacen {...form.uiProps("almacenId")} nombre="almacenId" />
                    <QInput label="Cantidad" {...form.uiProps("cantidad")} tipo="decimal" />
                    <QInput label="Fecha" {...form.uiProps("fecha")} tipo="fecha" />
                    <QInput label="Hora" {...form.uiProps("hora")} tipo="hora" />
                </quimera-formulario>
                <div className="botones">
                    <QBoton onClick={crear} deshabilitado={!form.valido}>
                        Crear
                    </QBoton>
                    <QBoton onClick={cancelar} variante="texto">
                        Cancelar
                    </QBoton>
                </div>
            </div>
        </Mostrar>
    );
};
