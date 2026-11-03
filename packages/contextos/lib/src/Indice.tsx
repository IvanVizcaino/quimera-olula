import { Link } from "react-router";

export const Indice = () => {
  return (
    <>
      <ul>
        <li>
          <Link to="/ventas/cliente">Maestro de clientes</Link>
        </li>
        <li>
          <Link to="/ventas/cliente/000001">Cliente #1</Link>
        </li>
        <li>
          <Link to="/ventas/pedido">Maestro pedidos</Link>
        </li>
        <li>
          <Link to="/ventas/presupuesto">Maestro de presupuestos</Link>
        </li>
        <li>
          <Link to="/ventas/albaran">Maestro de albaranes</Link>
        </li>
        <li>
          <Link to="/ventas/factura">Maestro de facturas</Link>
        </li>
      </ul>
    </>
  );
};
