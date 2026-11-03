import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { useState } from "react";
import { TipoProductoBancario } from "../diseño.js";
import { TIPOS_PRODUCTO_BANCARIO, conTipoProducto, etiquetaTipoProducto } from "../dominio.js";

/**
 * Paso previo al widget de los proveedores que cobran por producto leído
 * (Wealth Reader): qué tipos de producto se leen de la conexión. Cada cuenta o
 * préstamo que devuelva el banco es un producto.
 */
export const ElegirProductosConexionBancaria = ({
    onAceptar,
    onCancelar,
}: {
    onAceptar: (tipos: TipoProductoBancario[]) => void;
    onCancelar: () => void;
}) => {
    const [tipos, setTipos] = useState<TipoProductoBancario[]>(["accounts"]);

    return (
        <QModal abierto={true} nombre="elegirProductosConexionBancaria" titulo="Conectar banco" onCerrar={onCancelar}>
            <p>
                Elige qué productos quieres leer del banco. Cada cuenta o préstamo que tengas en él
                cuenta como un producto para la facturación del proveedor.
            </p>
            <quimera-formulario>
                {TIPOS_PRODUCTO_BANCARIO.map((tipo) => (
                    <QCheckbox
                        key={tipo}
                        nombre={`tipo_producto_${tipo}`}
                        label={etiquetaTipoProducto(tipo)}
                        valor={tipos.includes(tipo)}
                        onChange={(valor) => setTipos(conTipoProducto(tipos, tipo, valor === "true"))}
                    />
                ))}
            </quimera-formulario>
            <div className="botones maestro-botones">
                <QBoton onClick={() => onAceptar(tipos)} deshabilitado={tipos.length === 0}>
                    Continuar
                </QBoton>
            </div>
        </QModal>
    );
};
