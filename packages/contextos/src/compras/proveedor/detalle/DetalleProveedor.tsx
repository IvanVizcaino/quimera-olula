import { mostrarPestanaContabilidad } from "#/contabilidad/subcuentas_tercero/dominio.ts";
import { TabContabilidad } from "#/contabilidad/subcuentas_tercero/detalle/TabContabilidad.tsx";
import { Detalle } from "@olula/componentes/detalle/Detalle.tsx";
import { Tab, Tabs } from "@olula/componentes/detalle/tabs/Tabs.tsx";
import { useMaquina } from "@olula/componentes/hook/useMaquina.ts";
import { QuimeraAcciones } from "@olula/componentes/moleculas/qacciones.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { useModelo } from "@olula/lib/useModelo.ts";
import { puedeAlguna } from "@olula/lib/dominio.ts";
import { useCallback, useEffect } from "react";
import { BorrarProveedor } from "../borrar/BorrarProveedor.tsx";
import { Proveedor } from "../diseño.ts";
import { ArticulosProveedor } from "./articulos/ArticulosProveedor.tsx";
import { CuentasBancoProveedor } from "./cuentas_banco/CuentasBancoProveedor.tsx";
import {
  contextoDetalleProveedorInicial,
  guardarProveedor,
  metaProveedor,
} from "./detalle.ts";
import "./DetalleProveedor.css";
import { DireccionesProveedor } from "./direcciones/DireccionesProveedor.tsx";
import { documentosProveedor } from "./documentos/documentos.ts";
import { TabDocumentos } from "./documentos/TabDocumentos.tsx";
import { getMaquina } from "./maquina.ts";
import { TabComercial } from "./TabComercial.tsx";
import { TabGeneral } from "./TabGeneral.tsx";

export const DetalleProveedor = ({
  id,
  publicar = async () => {},
}: {
  id?: string;
  publicar?: EmitirEvento;
}) => {
  const { ctx, emitir } = useMaquina(
    getMaquina,
    contextoDetalleProveedorInicial,
    publicar
  );

  const autoGuardar = useCallback(
    async (proveedor: Proveedor) => {
      await guardarProveedor(ctx, proveedor);
      await emitir("proveedor_guardado");
    },
    [ctx, emitir]
  );

  const formModelo = useModelo(metaProveedor, ctx.proveedor, autoGuardar);

  const { estado, proveedor, direcciones, cuentas, articulos } = ctx;

  useEffect(() => {
    emitir("proveedor_id_cambiado", id, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!proveedor.id) return null;

  const titulo = (p: Proveedor) => `${p.nombre}`;

  const accionesProveedor = [
    {
      icono: "eliminar",
      texto: "Borrar",
      onClick: () => emitir("borrado_solicitado"),
      advertencia: true,
    },
    proveedor.deBaja
      ? { texto: "Dar de alta", onClick: () => emitir("alta_solicitada") }
      : { texto: "Dar de baja", onClick: () => emitir("baja_solicitada") },
  ];

  return (
    <Detalle
      id={id}
      obtenerTitulo={titulo}
      setEntidad={() => {}}
      entidad={proveedor}
      cerrarDetalle={() => emitir("proveedor_deseleccionado", null, true)}
    >
      <div className="DetalleProveedor">
        <div className="maestro-botones">
          <QuimeraAcciones acciones={accionesProveedor} vertical />
        </div>
        <Tabs
          children={[
            <Tab
              key="tab-general"
              label="General"
              children={<TabGeneral form={formModelo} proveedor={proveedor} />}
            />,
            <Tab
              key="tab-comercial"
              label="Comercial"
              children={<TabComercial form={formModelo} />}
            />,
            <Tab
              key="tab-direcciones"
              label="Direcciones"
              children={
                <DireccionesProveedor
                  proveedor={proveedor}
                  direcciones={direcciones}
                  estado={estado}
                  publicar={emitir}
                />
              }
            />,
            <Tab
              key="tab-articulos"
              label="Artículos"
              children={
                <ArticulosProveedor articulos={articulos} publicar={emitir} />
              }
            />,
            <Tab
              key="tab-cuentas"
              label="Cuentas bancarias"
              children={
                <CuentasBancoProveedor
                  proveedor={proveedor}
                  cuentas={cuentas}
                  estado={estado}
                  publicar={emitir}
                />
              }
            />,
            ...(puedeAlguna(documentosProveedor.map((d) => d.regla))
              ? [
                  <Tab
                    key="tab-documentos"
                    label="Documentos"
                    children={<TabDocumentos proveedorId={proveedor.id} />}
                  />,
                ]
              : []),
            ...(mostrarPestanaContabilidad()
              ? [
                  <Tab
                    key="tab-contabilidad"
                    label="Contabilidad"
                    children={
                      <TabContabilidad
                        tipo="proveedor"
                        terceroId={proveedor.id}
                        codigoSubcuenta={proveedor.subcuentaCodigo}
                      />
                    }
                  />,
                ]
              : []),
          ]}
        />
      </div>

      {estado === "BORRANDO" && (
        <BorrarProveedor proveedor={proveedor} publicar={emitir} />
      )}
    </Detalle>
  );
};
