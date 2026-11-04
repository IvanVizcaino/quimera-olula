import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.js";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { formatearFechaString } from "@olula/lib/dominio.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useContext, useEffect } from "react";
import { Inventario } from "../../diseño.ts";
import { patchInventario } from "../../infraestructura.ts";
import { BorrarInventario } from "../borrar/BorrarInventario.tsx";
import { BorrarLineaInventario } from "../borrar_linea/BorrarLineaInventario.tsx";
import { CargarLecturasInventario } from "../cargar_lecturas/CargarLecturasInventario.tsx";
import { CrearLineaInventario } from "../crear_linea/CrearLineaInventario.tsx";
import { RegularizarRestoInventario } from "../regularizar_resto/RegularizarRestoInventario.tsx";
import { contextoDetalleInventarioInicial, metaInventario } from "./dominio.ts";
import { LineasInventario } from "./lineas/LineasInventario.tsx";
import { getMaquina } from "./maquina.ts";

const titulo = (inventario: Inventario) => `Inventario ${inventario.id}`;

export const DetalleInventario = ({
    id,
    publicar = async () => {},
}: {
    id?: string;
    publicar?: EmitirEvento;
}) => {
    const { intentar } = useContext(ContextoError);

    const { ctx, emitir } = useMaquina(getMaquina, contextoDetalleInventarioInicial, publicar);

    const autoGuardar = useCallback(
        async (inventario: Inventario) => {
            await intentar(() =>
                patchInventario(inventario.id, { observaciones: inventario.observaciones })
            );
            await emitir("inventario_guardado");
        },
        [intentar, emitir]
    );

    const modelo = useModelo(metaInventario, ctx.inventario, autoGuardar);

    useEffect(() => {
        emitir("inventario_id_cambiado", id, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (!ctx.inventario.id) return null;

    const { inventario, lineas, estado, lineaActiva } = ctx;

    return (
        <Detalle
            id={id}
            obtenerTitulo={titulo}
            setEntidad={() => {}}
            entidad={inventario}
            cerrarDetalle={() => emitir("inventario_deseleccionado", null, true)}
        >
            <div className="DetalleInventario">
                <div className="maestro-botones">
                    <QBoton onClick={() => emitir("crear_linea_solicitado")}>Nueva línea</QBoton>
                    <QBoton onClick={() => emitir("cargar_lecturas_solicitado")}>Cargar fichero</QBoton>
                    <QBoton onClick={() => emitir("regularizar_resto_solicitado")}>Resto a 0</QBoton>
                    <QBoton onClick={() => emitir("borrado_solicitado")}>Borrar</QBoton>
                </div>
                <quimera-formulario>
                    <QInput label="Código" nombre="id" valor={inventario.id} soloLectura />
                    <QInput label="Almacén" nombre="almacen" valor={inventario.almacen ?? inventario.almacenId} soloLectura />
                    <QInput label="Fecha" nombre="fecha" valor={formatearFechaString(inventario.fecha)} soloLectura />
                    <QInput label="Hora" nombre="hora" valor={inventario.hora} soloLectura />
                    <QInput label="Observaciones" {...modelo.uiProps("observaciones")} />
                </quimera-formulario>
                <h4>Líneas ({lineas.length})</h4>
                <LineasInventario
                    lineas={lineas}
                    onBorrar={(linea) => emitir("borrar_linea_solicitado", linea)}
                />
            </div>

            {estado === "BORRANDO" && (
                <BorrarInventario inventario={inventario} publicar={emitir} />
            )}
            {estado === "CREANDO_LINEA" && (
                <CrearLineaInventario inventario={inventario} publicar={emitir} />
            )}
            {estado === "BORRANDO_LINEA" && lineaActiva && (
                <BorrarLineaInventario inventario={inventario} linea={lineaActiva} publicar={emitir} />
            )}
            {estado === "CARGANDO_LECTURAS" && (
                <CargarLecturasInventario inventario={inventario} publicar={emitir} />
            )}
            {estado === "REGULARIZANDO_RESTO" && (
                <RegularizarRestoInventario inventario={inventario} publicar={emitir} />
            )}
        </Detalle>
    );
};
