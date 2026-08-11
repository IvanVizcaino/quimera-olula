import { QAutocompletar } from "@olula/componentes/moleculas/qautocompletar.tsx";
import { ClausulaFiltro, Filtro } from "@olula/lib/diseño.ts";
import { useState } from "react";
import { getFacturas } from "../../factura/infraestructura.ts";

interface FacturaClienteProps {
  clienteId: string;
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  ref?: React.RefObject<HTMLInputElement | null>;
  onChange?: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const FacturaCliente = ({
  clienteId,
  descripcion = "",
  valor,
  nombre = "factura_id",
  label = "Factura",
  deshabilitado = false,
  onChange,
  ...props
}: FacturaClienteProps) => {
  const [intentoBusquedaSinCliente, setIntentoBusquedaSinCliente] =
    useState(false);

  const obtenerOpciones = async (texto: string) => {
    if (!texto || texto.trim() === "") {
      setIntentoBusquedaSinCliente(false);
      return [];
    }

    if (!clienteId || clienteId.trim() === "") {
      setIntentoBusquedaSinCliente(true);
      return [];
    }

    setIntentoBusquedaSinCliente(false);

    const criteria = {
      filtro: [
        ["codigo", "~", texto],
        ["codcliente", "~", clienteId],
      ] as ClausulaFiltro[],
      orden: ["id"],
    };

    const { datos } = await getFacturas(
      criteria.filtro as unknown as Filtro,
      criteria.orden,
      { pagina: 1, limite: 10 }
    );

    if (!Array.isArray(datos)) {
      return [];
    }

    return datos.map((factura) => ({
      valor: factura.id,
      descripcion: factura.codigo,
    }));
  };

  return (
    <QAutocompletar
      label={label}
      nombre={nombre}
      onChange={onChange}
      valor={valor}
      obtenerOpciones={obtenerOpciones}
      descripcion={descripcion}
      deshabilitado={deshabilitado}
      erroneo={intentoBusquedaSinCliente}
      textoValidacion={
        intentoBusquedaSinCliente
          ? "El campo cliente debe estar informado"
          : undefined
      }
      {...props}
    />
  );
};
