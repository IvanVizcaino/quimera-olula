import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/moleculas/qmodal.tsx";
import { ContextoError } from "@olula/lib/contexto.ts";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useContext } from "react";
import { Articulo } from "../diseño.ts";
import { getArticulo, postArticulo } from "../infraestructura.ts";
import { metaNuevoArticulo, nuevoArticuloVacio } from "./dominio.ts";

interface CrearArticuloProps {
  publicar?: EmitirEvento;
  onCancelar?: () => void;
  activo?: boolean;
}

export const CrearArticulo = ({
  publicar = async () => {},
  onCancelar = () => {},
  activo = false,
}: CrearArticuloProps) => {
  const nuevoArticulo = useModelo(metaNuevoArticulo, nuevoArticuloVacio);
  const { intentar } = useContext(ContextoError);

  const guardar = async () => {
    const id = await intentar(() =>
      postArticulo(nuevoArticulo.modelo as Articulo)
    );
    nuevoArticulo.init(nuevoArticuloVacio);
    const articuloCreado = await getArticulo(id);
    publicar("articulo_creado", articuloCreado);
    onCancelar();
  };

  if (!activo) return null;

  return (
    <QModal
      abierto={activo}
      nombre="crear_articulo"
      titulo="Nuevo Artículo"
      onCerrar={onCancelar}
    >
      <>
        <quimera-formulario>
          <QInput
            label="Descripción"
            autoSeleccion={true}
            {...nuevoArticulo.uiProps("descripcion")}
          />
        </quimera-formulario>
        <div className="botones">
          <QBoton
            onClick={guardar}
            deshabilitado={nuevoArticulo.valido === false}
          >
            Guardar
          </QBoton>
          <QBoton variante="texto" onClick={onCancelar}>
            Cancelar
          </QBoton>
        </div>
      </>
    </QModal>
  );
};
