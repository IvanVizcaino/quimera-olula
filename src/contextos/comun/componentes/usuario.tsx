import { QAutocompletar } from "../../../componentes/moleculas/qautocompletar.tsx";
import { Filtro } from "../../comun/diseño.ts";
import { getUsuarios } from "../../usuarios/usuario/infraestructura.ts";

interface UsuarioProps {
  descripcion?: string;
  valor: string;
  nombre?: string;
  label?: string;
  deshabilitado?: boolean;
  onChange: (opcion: { valor: string; descripcion: string } | null) => void;
}

export const Usuario = ({
  descripcion = "",
  valor,
  nombre = "usuario_id",
  label = "Usuario",
  deshabilitado = false,
  onChange,
  ...props
}: UsuarioProps) => {
  const obtenerOpciones = async (texto: string) => {
    const criteria = {
      filtro: ["nombre", "~", texto],
      orden: ["id"],
    };

    const { datos } = await getUsuarios(
      criteria.filtro as unknown as Filtro,
      criteria.orden
    );

    if (!Array.isArray(datos)) {
      console.error("Los usuarios no son un array:", datos);
      return [];
    }

    return datos.map((usuario) => ({
      valor: usuario.id,
      descripcion: usuario.nombre,
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
      {...props}
    />
  );
};
