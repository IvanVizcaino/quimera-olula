import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { LineaInventario } from "../../../diseño.ts";

const numero = (n: number) => n.toLocaleString("es-ES");

/** Líneas del inventario: cada una es la regularización de un artículo. */
export const LineasInventario = ({
    lineas,
    onBorrar,
}: {
    lineas: LineaInventario[];
    onBorrar: (linea: LineaInventario) => void;
}) => (
    <div className="LineasInventario">
        <table>
            <thead>
                <tr>
                    <th>Referencia</th>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Cant. anterior</th>
                    <th>Motivo</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {lineas.map((linea) => (
                    <tr key={linea.id}>
                        <td>{linea.articuloId}</td>
                        <td>{linea.descripcion ?? ""}</td>
                        <td>{numero(linea.cantidadFinal)}</td>
                        <td>{numero(linea.cantidadInicial)}</td>
                        <td>{linea.motivo ?? ""}</td>
                        <td>
                            <QBoton tamaño="pequeño" variante="texto" onClick={() => onBorrar(linea)}>
                                Borrar
                            </QBoton>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
