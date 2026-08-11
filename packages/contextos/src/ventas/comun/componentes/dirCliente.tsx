import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { formatearDireccionUnaLinea } from "@olula/lib/dominio.ts";
import { useEffect, useState } from "react";
import { getDirecciones } from "../../cliente/infraestructura.ts";
interface DireccionesProps {
  clienteId: string | undefined;
  valor?: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const DirCliente = ({
  clienteId,
  valor,
  nombre = "direccion_id",
  label = "Dirección",
  deshabilitado = false,
  onChange,
  ...props
}: DireccionesProps) => {
  const [opcionesDireccion, setOpcionesDireccion] = useState<
    { valor: string; descripcion: string }[]
  >([]);

  useEffect(() => {
    const fetchDirecciones = async () => {
      if (!clienteId) {
        setOpcionesDireccion([]);
        return;
      }

      const direcciones = await getDirecciones(clienteId);
      const opciones = direcciones.map((direccion) => ({
        valor: direccion.id,
        // descripcion: `${direccion.tipo_via} ${direccion.nombre_via}, ${direccion.ciudad}`,
        descripcion: formatearDireccionUnaLinea(direccion),
      }));
      setOpcionesDireccion(opciones);
    };

    fetchDirecciones();
  }, [clienteId]);

  return (
    <QSelect
      {...props}
      label={label}
      nombre={nombre}
      valor={valor}
      deshabilitado={deshabilitado}
      opciones={opcionesDireccion}
      onChange={onChange}
    />
  );
};
