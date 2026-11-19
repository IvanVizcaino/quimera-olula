import { schemasPartesCarros } from "@quimera-extension/vbarba-almacen/static/schemasPartesCarros";
import { Field, Schema } from "quimera/lib";

// const validationCantidadesProveedor = data =>
//   data.lista
//     .filter(lineaItem => lineaItem.idLineaPc === data.linea.idLineaPc)
//     .reduce((accum, item) => accum + item.cantidadOk + item.cantidadKo, 0) >
//     data.linea.cantidadFactura && {
//     error: true,
//     message: "",
//   };

//   descuento: Field.Float("dto", "Descuento")
//   .default(0.0)
//   .validation(
//     ({ descuento }) =>
//       descuento >= 0 &&
//       descuento <= 100 && {
//         error: true,
//         message: "El descuento debe ser un valor entre 0 y 100",
//       },
//   ),

export default parent => {
  return {
    ...parent,
    albaranescli: parent.albaranescli.fields({
      codigoParte: Field.Text("codigoparte", "Codigo parte"),
      idParteES: Field.Text("idpartees", "Id parte E/S"),
      estadoFirma: Field.Text("estadofirma", "Estado de firma"),
      puestoFirma: Field.Text("puestofirma", "Puesto de firma"),
      idFirma: Field.Text("idfirma", "Id de la firma"),
      observacionesFirma: Field.Text("observacionesfirma", "Observaciones de firma"),
    }),
    contacto: Schema("contactos", "codcliente").fields({
      nombre: Field.Text("nombre", "nombre"),
      nif: Field.Text("nif", "nif"),
    }),
    firmasdealbaranes: Schema("firmasdealbaranes", "idalbaran").fields({
      idAlbaran: Field.Text("idalbaran", "idalbaran"),
      codigo: Field.Text("codigo", "codigo"),
      codContacto: Field.Text("codcontacto", "codContacto"),
      firmadopor: Field.Text("firmadopor", "firmadopor"),
      cifnif: Field.Text("cifnif", "cifnif"),
      puesto: Field.Text("puesto", "puesto"),
      fecha: Field.Text("fecha", "fecha"),
      hora: Field.Text("hora", "hora"),
      observacionesfirma: Field.TextArea("observacionesfirma", "observacionesfirma").default(""),
      estado: Field.Text("estado", "estado"),
      firma: Field.Text("firma", "firma"),
    }),
    ...schemasPartesCarros,
    puestosdefirma: Schema("vb_puestosdefirma", "puesto")
      .fields({
        puesto: Field.Text("puesto", "puesto"),
        tipofirma: Field.Text("tipofirma", "tipofirma"),
      })
      .filter(() => ["tipofirma", "eq", "WEB"]),
    mispuestosdefirma: Schema("vb_puestosdefirma", "puesto")
      .fields({
        key: Field.Text("puesto", "puesto"),
        value: Field.Text("puesto", "puesto"),
        tipofirma: Field.Text("tipofirma", "tipofirma"),
      })
      .filter(() => ["tipofirma", "eq", "WEB"]),
  };
};
