import { Almacen } from "#/almacen/comun/componentes/Almacen.tsx";
import { Divisa } from "#/comun/componentes/divisa.tsx";
import { BotonCambiar } from "#/ventas/comun/componentes/BotonCambiar.tsx";
import { FormaPago } from "#/comun/componentes/formapago.tsx";
import { GrupoIvaNegocio } from "#/comun/componentes/grupo_iva_negocio.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { HookModelo } from "@olula/lib/useModelo.ts";
import { Factura } from "../diseño.ts";
import { facturaEditable } from "../dominio.ts";
import { descripcionOrigenFactura } from "../dominio.ts";
import "./TabDatos.css";

export const TabDatos = ({
    form,
    publicar,
}: {
    form: HookModelo<Factura>;
    publicar: EmitirEvento;
}) => {
    const { uiProps, modelo } = form;
    const puedeCambiarDivisa = facturaEditable(modelo);

    return (
        <div className="TabDatos">
            <quimera-formulario>
                <QInput label="Código" {...uiProps("codigo")} />
                <QInput
                    label="Origen"
                    {...uiProps("automatica")}
                    valor={descripcionOrigenFactura(modelo)}
                    deshabilitado={true}
                />
                <Almacen {...uiProps("almacenId", "nombreAlmacen")} nombre="almacenId" />
                <Divisa {...uiProps("divisaId")} nombre="divisaId" />
                <QInput label="T. Conversión" {...uiProps("tasaConversion")} />
        {puedeCambiarDivisa && (
          <div className="TabDatos-accion">
            <BotonCambiar
              titulo="Cambiar divisa y tasa de conversión"
              onClick={() => publicar("cambio_divisa_solicitado")}
            />
          </div>
        )}
                <FormaPago
                    {...uiProps("formaPagoId", "nombreFormaPago")}
                    nombre="formaPagoId"
                />
                <GrupoIvaNegocio
                    {...uiProps("grupoIvaNegocioId")}
                    nombre="grupoIvaNegocioId"
                />
                <QInput label="Rectifica a" {...uiProps("codigoRectificativa")} />
                <QCheckbox label="De abono" {...uiProps("deAbono")} />
                <QCheckbox label="Servicios" {...uiProps("servicios")} />
                <QCheckbox label="No generar asiento" {...uiProps("noGenerarAsiento")} />
            </quimera-formulario>
        </div>
    );
};
