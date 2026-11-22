import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { MetaTabla, QTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { Banco, Sucursal } from "../../diseño.ts";

const metaTablaSucursales: MetaTabla<Sucursal> = [
    { id: "agencia", cabecera: "Nº de oficina" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "poblacion", cabecera: "Población" },
    { id: "provincia", cabecera: "Provincia" },
    { id: "telefono", cabecera: "Teléfono" },
];

/** Pestaña «Sucursales» de Eneboo `bancos.ui`. */
export const SucursalesBanco = ({
    banco,
    publicar,
    editable,
}: {
    banco: Banco;
    publicar: EmitirEvento;
    editable: boolean;
}) => (
    <div className="SucursalesBanco">
        <h3>Sucursales</h3>
        {editable && (
            <div className="botones maestro-botones">
                <QBoton onClick={() => publicar("crear_sucursal_solicitado")}>Nueva sucursal</QBoton>
            </div>
        )}
        <QTabla<Sucursal>
            metaTabla={[
                ...metaTablaSucursales,
                {
                    id: "acciones",
                    cabecera: "",
                    render: (sucursal: Sucursal) =>
                        editable && (
                            <span className="sucursales-acciones">
                                <QBoton
                                    tamaño="pequeño"
                                    variante="borde"
                                    onClick={() => publicar("cambiar_sucursal_solicitado", sucursal)}
                                >
                                    Editar
                                </QBoton>
                                <QBoton
                                    tamaño="pequeño"
                                    variante="borde"
                                    advertencia
                                    onClick={() => publicar("borrar_sucursal_solicitado", sucursal)}
                                >
                                    Borrar
                                </QBoton>
                            </span>
                        ),
                },
            ]}
            datos={banco.sucursales}
            cargando={false}
            orden={[]}
        />
    </div>
);
