import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { FacturaCliente } from "#/ventas/comun/componentes/facturaCliente.tsx";
// import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { QBoton } from "@olula/componentes/atomos/qboton.tsx";
import { QInput } from "@olula/componentes/atomos/qinput.tsx";
import { QModal, QTextArea } from "@olula/componentes/index.js";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useForm } from "@olula/lib/useForm.js";
import { useModelo } from "@olula/lib/useModelo.ts";
import { useCallback } from "react";
import { CategoriaIncidencia } from "../../../../componentes/CategoriaIncidencia.tsx";
import { SubCategoriaIncidencia } from "../../../../componentes/SubCategoriaIncidencia.tsx";
import {
  CategoriaIncidencia as CategoriaIncidenciaType,
  TipoIncidencia,
} from "../diseño.ts";
import { getIncidencia, postIncidencia } from "../infraestructura.ts";
import "./CrearIncidencia.css";
import { metaNuevaIncidencia, nuevaIncidenciaVacia } from "./crear.ts";

export const CrearIncidencia = ({ publicar }: { publicar: EmitirEvento }) => {
  const { modelo, uiProps, valido, set } = useModelo(
    metaNuevaIncidencia,
    nuevaIncidenciaVacia
  );

  const crear_ = useCallback(async () => {
    const id = await postIncidencia(modelo);
    const incidencia = await getIncidencia(id);
    publicar("incidencia_creada", incidencia);
  }, [modelo, publicar]);

  const cancelar_ = useCallback(
    () => publicar("creacion_incidencia_cancelada"),
    [publicar]
  );

  const [crear, cancelar] = useForm(crear_, cancelar_);

  const handleClienteChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        set({
          ...modelo,
          clienteId: opcion.valor,
          nombreCliente: opcion.descripcion,
          facturaId: "",
          codigoFactura: "",
        });
      } else {
        set({
          ...modelo,
          clienteId: "",
          nombreCliente: "",
          facturaId: "",
          codigoFactura: "",
        });
      }
    },
    [modelo, set]
  );

  const handleFacturaChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        set({
          ...modelo,
          facturaId: opcion.valor,
          codigoFactura: opcion.descripcion,
        });
      } else {
        set({ ...modelo, facturaId: "", codigoFactura: "" });
      }
    },
    [modelo, set]
  );

  const handleArticuloChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        set({ ...modelo, articuloId: opcion.valor });
      } else {
        set({ ...modelo, articuloId: "" });
      }
    },
    [modelo, set]
  );

  const handleCategoriaChange = useCallback(
    (
      opcion: {
        valor: string;
        descripcion: string;
        tipoIncidencia?: string;
      } | null
    ) => {
      if (opcion) {
        const nuevoTipo =
          (opcion.tipoIncidencia as TipoIncidencia) || modelo.tipoIncidencia;
        set({
          ...modelo,
          categoriaIncidencia: opcion.valor as CategoriaIncidenciaType,
          subCategoriaIncidencia: "",
          tipoIncidencia: nuevoTipo,
          ...(nuevoTipo !== "Proveedor" && { articuloId: "" }),
        });
      } else {
        set({
          ...modelo,
          categoriaIncidencia: "INCIDT" as CategoriaIncidenciaType,
          subCategoriaIncidencia: "",
          tipoIncidencia: "Transportista" as TipoIncidencia,
          articuloId: "",
        });
      }
    },
    [modelo, set]
  );

  const handleSubCategoriaChange = useCallback(
    (opcion: { valor: string; descripcion: string } | null) => {
      if (opcion) {
        set({ ...modelo, subCategoriaIncidencia: opcion.valor });
      } else {
        set({ ...modelo, subCategoriaIncidencia: "" });
      }
    },
    [modelo, set]
  );

  // console.log("mimensaje_modelo.subCategoriaIncidencia", modelo.subCategoriaIncidencia);

  return (
    <QModal
      abierto={true}
      nombre="mostrar"
      titulo="Nueva Incidencia"
      onCerrar={cancelar}
    >
      <div className="CrearIncidencia">
        <quimera-formulario>
          <QInput label="Descripción" {...uiProps("descripcion")} />
          {/* <QInput label="Nombre Cliente" {...uiProps("nombreCliente")} /> */}
          <Cliente
            valor={modelo.clienteId}
            descripcion={modelo.nombreCliente}
            onChange={handleClienteChange}
          />
          <CategoriaIncidencia
            valor={modelo.categoriaIncidencia || ""}
            onChange={handleCategoriaChange}
          />
          <SubCategoriaIncidencia
            valor={modelo.subCategoriaIncidencia || ""}
            categoriaIncidencia={modelo.categoriaIncidencia || ""}
            onChange={handleSubCategoriaChange}
          />
          <FacturaCliente
            clienteId={modelo.clienteId}
            valor={modelo.facturaId || ""}
            onChange={handleFacturaChange}
          />
          {modelo.tipoIncidencia === "Proveedor" && (
            <Articulo
              valor={modelo.articuloId || ""}
              onChange={handleArticuloChange}
            />
          )}
          <QTextArea
            label="Observaciones"
            rows={5}
            {...uiProps("observaciones")}
          />
        </quimera-formulario>

        <div className="botones">
          <QBoton onClick={crear} deshabilitado={!valido}>
            Guardar
          </QBoton>
          <QBoton onClick={cancelar} variante="texto">
            Cancelar
          </QBoton>
        </div>
      </div>
    </QModal>
  );
};
