import { PartidaAsiento } from "../../diseño.ts";
import { descuadrePartidas, totalDebe, totalHaber } from "../../dominio.ts";

export const PartidasAsientoLista = ({ partidas }: { partidas: PartidaAsiento[] }) => (
    <div className="PartidasAsientoLista">
        <h3>Partidas</h3>
        <table className="qtabla">
            <thead>
                <tr>
                    <th>Subcuenta</th>
                    <th>Debe</th>
                    <th>Haber</th>
                    <th>Concepto</th>
                </tr>
            </thead>
            <tbody>
                {partidas.map((p) => (
                    <tr key={p.id}>
                        <td>{p.codigoSubcuenta || p.subcuentaId}</td>
                        <td>{p.debe.toFixed(2)}</td>
                        <td>{p.haber.toFixed(2)}</td>
                        <td>{p.concepto}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <p className="PartidasAsientoLista-totales">
            Debe: {totalDebe(partidas).toFixed(2)} · Haber: {totalHaber(partidas).toFixed(2)}
            {Math.abs(descuadrePartidas(partidas)) >= 0.005 && (
                <strong> · Descuadre: {descuadrePartidas(partidas).toFixed(2)}</strong>
            )}
        </p>
    </div>
);
