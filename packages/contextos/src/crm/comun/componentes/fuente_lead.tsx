import { QSelect } from "@olula/componentes/atomos/qselect.tsx";
import { useEffect, useState } from "react";
import { getFuentesLead } from "../../fuenteLead/infraestructura.ts";

interface FuenteLeadsProps {
  valor: string;
  nombre?: string;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
  getProps?: (campo: string) => Record<string, unknown>;
}

export const FuenteLead = ({
  valor,
  nombre = "fuente_id",
  onChange,
  ...props
}: FuenteLeadsProps) => {
  const [opcionesFuenteLead, setOpcionesFuenteLead] = useState<
    { valor: string; descripcion: string }[]
  >([]);

  useEffect(() => {
    const cargarOpcionesFuenteLead = async () => {
      const opciones = await getFuentesLead([], [], {
        pagina: 1,
        limite: 100,
      }).then((respuesta) => respuesta.datos);
      const opcionesMapeadas = opciones.map((opcion) => ({
        valor: String(opcion.id),
        descripcion: String(opcion.descripcion),
      }));
      setOpcionesFuenteLead(opcionesMapeadas);
    };

    cargarOpcionesFuenteLead();
  }, []);

  return (
    <QSelect
      label="Fuente"
      nombre={nombre}
      valor={valor}
      onChange={onChange}
      opciones={opcionesFuenteLead}
      {...props}
    />
  );
};
