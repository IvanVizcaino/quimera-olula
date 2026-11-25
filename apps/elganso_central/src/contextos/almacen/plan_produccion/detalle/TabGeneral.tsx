import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Proveedor } from "#/compras/comun/componentes/proveedor.tsx";
import { QDate } from "@olula/componentes/atomos/qdate.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { QTextArea } from "@olula/componentes/atomos/qtextarea.tsx";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { CabeceraPlanProduccion } from "../diseño.ts";
import "./TabGeneral.css";

export const TabGeneral = ({ form }: { form: HookModelo<CabeceraPlanProduccion> }) => {
    const { uiProps } = form;

    return (
        <div className="TabGeneral">
            <quimera-formulario>
                <QInput label="Descripción" {...uiProps("descripcion")} />
                <QSelect
                    label="Estado"
                    {...uiProps("estado")}
                    opciones={[
                        { valor: "Abierto", descripcion: "Abierto" },
                        { valor: "Cerrado", descripcion: "Cerrado" },
                    ]}
                />
                <QDate label="Fecha" {...uiProps("fecha")} />
                <QDate label="Fecha solicitada" {...uiProps("fechaSolicitada")} />
                <QDate label="Fecha proveedor" {...uiProps("fechaProveedor")} />

                {/* Se aplican a todas las líneas del plan al guardar */}
                <Proveedor label="Proveedor" {...uiProps("proveedorId", "nombreProveedor")} />
                <Almacen label="Almacén destino" {...uiProps("almacenId", "nombreAlmacen")} />
                <QDate label="Fecha de entrega" {...uiProps("fechaEntrega")} />

                <QTextArea label="Observaciones" {...uiProps("observaciones")} />
            </quimera-formulario>
        </div>
    );
};
