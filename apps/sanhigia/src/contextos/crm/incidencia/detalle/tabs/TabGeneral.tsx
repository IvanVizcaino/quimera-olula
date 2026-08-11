import { Articulo } from "#/almacen/comun/componentes/Articulo.tsx";
import { Cliente } from "#/ventas/comun/componentes/cliente.tsx";
import { FacturaCliente } from "#/ventas/comun/componentes/facturaCliente.tsx";
import {
  QBoton,
  QCheckbox,
  QDate,
  QInput,
  QSelect,
  QTextArea,
  Tab,
  Tabs,
} from "@olula/componentes/index.js";
import { HookModelo } from "@olula/lib/useModelo.js";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { CategoriaIncidencia } from "../../../../../componentes/CategoriaIncidencia.tsx";
import { SubCategoriaIncidencia } from "../../../../../componentes/SubCategoriaIncidencia.tsx";
import {
  CategoriaIncidencia as CategoriaIncidenciaType,
  Incidencia,
  TipoIncidencia,
} from "../../diseño.ts";
import "./TabGeneral.css";

export const TabGeneral = ({
  incidencia,
}: {
  incidencia: HookModelo<Incidencia>;
}) => {
  const { uiProps, set, modelo } = incidencia;
  const navigate = useNavigate();

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

  // Helper para convertir valores a boolean
  const toBool = (valor: boolean | string | undefined): boolean => {
    return valor === true || valor === "true";
  };

  // Helper para manejar onChange de checkboxes
  const handleCheckboxChange = (campo: keyof Incidencia) => (valor: string) => {
    uiProps(campo as string).onChange(valor === "true" ? "true" : "false");
  };

  // console.log("mimensaje_modelo", modelo.codigoAlbaran);

  return (
    <div className="TabGeneral">
      <quimera-formulario>
        <QInput label="Descripción" {...uiProps("descripcion")} />
        <QInput label="Causante" {...uiProps("nombreCausante")} deshabilitado />
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
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <FacturaCliente
              clienteId={modelo.clienteId}
              descripcion={modelo.codigoFactura || ""}
              valor={modelo.facturaId || ""}
              onChange={handleFacturaChange}
            />
          </div>
          <div style={{ flex: 1 }}>
            <QInput
              label="Albarán"
              {...uiProps("codigoAlbaran")}
              deshabilitado
            />
          </div>
        </div>
        <QDate label="Fecha" {...uiProps("fecha")} />
        <QSelect
          label="Prioridad"
          {...uiProps("prioridad")}
          opciones={[
            { valor: "Baja", descripcion: "Baja" },
            { valor: "Media", descripcion: "Media" },
            { valor: "Alta", descripcion: "Alta" },
          ]}
        />
        <QSelect
          label="Estado"
          {...uiProps("estado")}
          opciones={[
            { valor: "Nueva", descripcion: "Nueva" },
            { valor: "Pendiente", descripcion: "Pendiente" },
            { valor: "Pendiente de datos", descripcion: "Pendiente de datos" },
            { valor: "Asignada", descripcion: "Asignada" },
            { valor: "Rechazada", descripcion: "Rechazada" },
            { valor: "Cerrada", descripcion: "Cerrada" },
          ]}
        />

        {modelo.tipoIncidencia === "Proveedor" && (
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Articulo
                valor={modelo.articuloId || ""}
                onChange={handleArticuloChange}
                label="Artículo"
              />
            </div>
            <QCheckbox
              label="En garantía"
              nombre="enGarantia"
              valor={toBool(modelo.enGarantia)}
              onChange={handleCheckboxChange("enGarantia")}
              deshabilitado
            />
          </div>
        )}

        {modelo.presupuestoId && (
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <QInput
                label={`Presupuesto `}
                nombre="presupuesto"
                valor={modelo.codigoPresupuesto}
                deshabilitado
              />
            </div>
            <QBoton
              tamaño="pequeño"
              onClick={() =>
                navigate(`/ventas/presupuestos/${modelo.presupuestoId}`)
              }
            >
              Ir a presupuesto
            </QBoton>
          </div>
        )}
        <div className="Tabs">
          <Tabs>
            <Tab label="Observaciones">
              <QTextArea label="" rows={5} {...uiProps("observaciones")} />
            </Tab>
            <Tab label="Resolución">
              <QTextArea label="" rows={5} {...uiProps("resolucion")} />
            </Tab>
          </Tabs>
        </div>
      </quimera-formulario>
    </div>
  );
};
