import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { listaEntidadesInicial } from "@olula/lib/ListaEntidades.js";
import { useEffect, useMemo } from "react";
import { Inventario, LineaInventario } from "../../diseño.ts";
import { etiquetaInventario, inventarioEditable, inventarioVacio } from "../../dominio.ts";
import { CerrarInventario } from "../cerrar/CerrarInventario.tsx";
import { ImportarCsvInventario } from "../importar_csv/ImportarCsvInventario.tsx";
import { RegularizarInventario } from "../regularizar/RegularizarInventario.tsx";
import { RestoACeroInventario } from "../resto_a_cero/RestoACeroInventario.tsx";
import { LineasInventario } from "./lineas/LineasInventario.tsx";
import { ContextoDetalleInventario, getMaquina } from "./maquina.ts";
import { TabGeneralInventario } from "./TabGeneralInventario.tsx";

export const DetalleInventario = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const contextoInicial: ContextoDetalleInventario = {
        estado: "INICIAL",
        inventario: inventarioVacio(),
        lineas: listaEntidadesInicial<LineaInventario>(),
        resultadoRegularizacion: null,
    };

    const { ctx, emitir } = useMaquina(getMaquina, contextoInicial, publicar);

    useEffect(() => {
        emitir("inventario_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const editable = useMemo(() => inventarioEditable(ctx.inventario), [ctx.inventario]);

    if (!ctx.inventario.id) return null;

    const titulo = (inv: Inventario) =>
        inv.cerrado ? `${etiquetaInventario(inv)} (cerrado)` : etiquetaInventario(inv);

    const accionesDetalle = editable
        ? [
              {
                  icono: "actualizar",
                  texto: "Regularizar stock",
                  onClick: () => emitir("regularizar_solicitado"),
              },
              { texto: "Resto a cero", onClick: () => emitir("resto_a_cero_solicitado") },
              { texto: "Importar CSV", onClick: () => emitir("importar_csv_solicitado") },
              { texto: "Exportar CSV", onClick: () => emitir("exportar_csv_solicitado") },
              { texto: "Cerrar inventario", onClick: () => emitir("cerrar_solicitado") },
          ]
        : [{ texto: "Exportar CSV", onClick: () => emitir("exportar_csv_solicitado") }];

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={ctx.inventario}
            cerrarDetalle={() => emitir("inventario_deseleccionado", null, true)}
        >
            <div className="DetalleInventario">
                <div className="maestro-botones">
                    <QuimeraAcciones acciones={accionesDetalle} />
                </div>
                <Tabs
                    children={[
                        <Tab
                            key="general"
                            label="General"
                            children={<TabGeneralInventario inventario={ctx.inventario} />}
                        />,
                    ]}
                />
                <LineasInventario
                    inventario={ctx.inventario}
                    lineas={ctx.lineas}
                    estado={ctx.estado}
                    editable={editable}
                    publicar={emitir}
                />
            </div>
            {ctx.estado === "REGULARIZANDO" && (
                <RegularizarInventario inventario={ctx.inventario} publicar={emitir} />
            )}
            {ctx.estado === "RESTO_A_CERO" && (
                <RestoACeroInventario inventario={ctx.inventario} publicar={emitir} />
            )}
            {ctx.estado === "IMPORTANDO_CSV" && (
                <ImportarCsvInventario inventario={ctx.inventario} publicar={emitir} />
            )}
            {ctx.estado === "CERRANDO" && (
                <CerrarInventario inventario={ctx.inventario} publicar={emitir} />
            )}
        </Detalle>
    );
};
