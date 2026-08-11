import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal } from "@olula/componentes/index.js";
import { Articulo } from "@olula/ctx/ventas/comun/componentes/articulo.tsx";
import { GrupoIvaProducto } from "@olula/ctx/ventas/comun/componentes/grupo_iva_producto.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback, useState } from "react";
import { TagArticulo } from "../../articulo/diseño.ts";
import { LineaPresupuesto } from "../diseño.ts";
import { patchLinea } from "../infraestructura.ts";
import { metaLinea } from "./dominio.ts";
import "./CambiarLinea.css";

export const CambiarLinea = ({
  presupuestoId,
  publicar,
  linea,
}: {
  presupuestoId: string;
  linea: LineaPresupuesto;
  publicar: EmitirEvento;
}) => {
  const { modelo, uiProps, valido, set } = useModelo(metaLinea, linea);
  const [mostrarMas, setMostrarMas] = useState(false);

  const cambiar_ = useCallback(async () => {
    await patchLinea(presupuestoId, modelo);
    publicar("linea_actualizada");
  }, [modelo, publicar, presupuestoId]);

  const cancelar_ = useCallback(
    () => publicar("editar_linea_cancelado"),
    [publicar]
  );

  const [cambiar, cancelar] = useForm(cambiar_, cancelar_);

  const handleArticuloChange = useCallback(
    (
      opcion: { valor: string; descripcion: string; datos?: TagArticulo } | null
    ) => {
      if (!opcion) return;

      const articulo = opcion.datos;
      if (!articulo) return;

      set({
        ...modelo,
        referencia: opcion.valor,
        descripcion: opcion.descripcion,
        pvp_unitario: articulo.precio,
        grupo_iva_producto_id: articulo.grupo_iva_producto_id,
      });
    },
    [modelo, set]
  );

  return (
    <QModal
      abierto={true}
      nombre="editar_linea_presupuesto"
      titulo="Editar línea"
      onCerrar={cancelar}
    >
      <div className="EditarLinea">
        <quimera-formulario>
          <div className="articulo-info">
            <span className="articulo-ref">Ref. {linea.referencia}</span>
          </div>

          <Articulo
            {...uiProps("referencia", "descripcion")}
            onChange={handleArticuloChange}
          />

          <QInput label="Cantidad" {...uiProps("cantidad")} />

          <QInput label="Precio" {...uiProps("pvp_unitario")} />

          <div className="mostrar-mas-fila">
            <button
              type="button"
              className="mostrar-mas-btn"
              onClick={() => setMostrarMas((v) => !v)}
            >
              {mostrarMas ? "▲ Menos opciones" : "▼ Más opciones"}
            </button>
          </div>

          {mostrarMas && (
            <>
              <GrupoIvaProducto {...uiProps("grupo_iva_producto_id")} />
              <QInput label="% Descuento" {...uiProps("dto_porcentual")} />
            </>
          )}
        </quimera-formulario>

        <div className="botones maestro-botones ">
          <QBoton onClick={cambiar} deshabilitado={!valido}>
            Guardar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
