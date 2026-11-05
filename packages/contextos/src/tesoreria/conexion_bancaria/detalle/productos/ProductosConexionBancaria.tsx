import { QAviso } from "@olula/componentes/atomos/qaviso.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QCheckbox } from "@olula/componentes/atomos/qcheckbox.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { ConexionBancaria } from "../../diseño.js";
import {
    TIPOS_PRODUCTO_BANCARIO,
    conTipoProducto,
    etiquetaTipoProducto,
    tiposProductoSinLeer,
} from "../../dominio.js";
import "./ProductosConexionBancaria.css";

/**
 * Tipos de producto que se leen del banco (el proveedor cobra por producto
 * leído). Se guardan al vuelo. Un tipo nuevo no tiene productos hasta que se
 * vuelve a leer el banco con su widget (reautenticar), que además pide al
 * usuario que confirme el acceso.
 */
export const ProductosConexionBancaria = ({
    conexion,
    publicar,
}: {
    conexion: ConexionBancaria;
    publicar: EmitirEvento;
}) => {
    const sinLeer = tiposProductoSinLeer(conexion);

    return (
        <div className="ProductosConexionBancaria">
            <p>
                Se sincronizan los productos activos de estos tipos. Puedes desactivar un producto
                concreto en sus pestañas para dejar de leerlo.
            </p>
            <quimera-formulario>
                {TIPOS_PRODUCTO_BANCARIO.map((tipo) => (
                    <QCheckbox
                        key={tipo}
                        nombre={`tipo_producto_${tipo}`}
                        label={etiquetaTipoProducto(tipo)}
                        valor={conexion.tiposProducto.includes(tipo)}
                        onChange={(valor) => {
                            const tipos = conTipoProducto(conexion.tiposProducto, tipo, valor === "true");
                            if (tipos.length) publicar("tipos_producto_cambiados", tipos);
                        }}
                    />
                ))}
            </quimera-formulario>
            {sinLeer.length > 0 && (
                <QAviso variante="advertencia">
                    {`Todavía no se han leído ${sinLeer.map(etiquetaTipoProducto).join(", ").toLowerCase()} del banco.`}
                    <QBoton tamaño="pequeño" variante="borde" onClick={() => publicar("reautenticacion_solicitada")}>
                        Leer el banco
                    </QBoton>
                </QAviso>
            )}
        </div>
    );
};
