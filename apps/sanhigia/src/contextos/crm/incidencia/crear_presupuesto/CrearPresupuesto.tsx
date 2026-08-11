import { QModalConfirmacion } from "@olula/componentes/moleculas/qmodalconfirmacion.tsx";
import { EmitirEvento } from "@olula/lib/diseño.js";
import { useForm } from "@olula/lib/useForm.js";
import { useCallback } from "react";
import { useNavigate } from "react-router";
import { Incidencia } from "../diseño.ts";
import { crearPresupuestoIncidencia } from "../infraestructura.ts";

export const CrearPresupuesto = ({
  publicar,
  incidencia,
}: {
  incidencia: Incidencia;
  publicar: EmitirEvento;
}) => {
  const navigate = useNavigate();

  const crearPresupuesto_ = useCallback(async () => {
    const idPresupuesto = await crearPresupuestoIncidencia(incidencia);
    publicar("presupuesto_creado", incidencia.id);
    navigate(`/ventas/presupuestos/${idPresupuesto}`);
  }, [publicar, incidencia, navigate]);

  const cancelar_ = useCallback(
    () => publicar("creacion_presupuesto_cancelada"),
    [publicar]
  );

  const [crearPresupuesto, cancelar] = useForm(crearPresupuesto_, cancelar_);

  return (
    <QModalConfirmacion
      nombre="confirmarCrearPresupuesto"
      abierto={true}
      titulo="Confirmar crear presupuesto"
      mensaje={`¿Está seguro de que desea crear un presupuesto para esta incidencia?`}
      onCerrar={cancelar}
      onAceptar={crearPresupuesto}
    />
  );
};
