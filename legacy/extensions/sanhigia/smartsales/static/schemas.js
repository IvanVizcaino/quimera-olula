import { util } from "quimera";
import { ACL, Field, Schema } from "quimera/lib";

export default parent => ({
  ...parent,
  user: parent.user.fields({
    supervisor: Field.Text("supervisor", "Supervisor"),
    idCompany: Field.Int("idcompany", "Empresa").dump(
      _ => util.getGlobalSetting("user_data").user.company,
    ),
  }),
  pedidoCliNuevo: parent.pedidoCliNuevo.fields({
    idTrato: Field.Bool("idtrato", "Trato"),
    codAgente: Field.Text("codagente", "Cod. Agente"),
    codAgenteMkt: Field.Text("codagentemkt", "Agente marketing").default(null),
  }),
  asociarPedido: Schema("pedidoscli", "idpedido").fields({
    // codDir: Field.Int("coddir", "Id. Dir").required(),
    idPedido: Field.Int("idpedido", "idPedido"),
    idTrato: Field.Int("idtrato", "Trato"),
    codCliente: Field.Text("codcliente", "Cliente"),
    // sh_ctrlestadoborr: Field.Bool("sh_ctrlestadoborr", "Borrador").default(true),
    // fechaSalida: Field.Bool("fechasalida", "Fecha salida").default(util.today()),
    // regimenIva: Field.Text("regimeniva", "Origen mercancia").default(null),
    // codEvento: Field.Text("codevento", "Evento").default(null).required()
  }),
  contacto: Schema("contactos", "codcontacto").fields({
    codContacto: Field.Text("codcontacto", "Cod. Contacto").auto(),
    nombre: Field.Text("nombre", "Nombre").required(),
    email: Field.Text("email", "E-mail")
      .required()
      .validation(
        ({ email }) =>
          !email?.match(/^(?!\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}$/) && {
            error: true,
            message: "Formato de e-mail no válido",
          },
      ),
    telefono: Field.Text("telefono1", "Teléfono"),
    direccion: Field.Text("direccion", "Dirección"),
    codPostal: Field.Text("codpostal", "Cód. Postal"),
    ciudad: Field.Text("ciudad", "Ciudad"),
    cliente: Field.Text("codcliente", "Cliente"),
    agente: Field.Text("codagente", "Agente"),
    enlista: Field.Text("enlista", "En lista").dump(false),
    idCompany: Field.Int("idcompany", "Empresa").dump(
      _ => util.getGlobalSetting("user_data").user.company,
    ),
    datosRevisados: Field.Bool("datosrevisados", "Datos de contacto revisados").default(false),
  }),
  agente: Schema("agentes", "codagente").fields({
    codAgente: Field.Text("codagente", "Cod. Agente").auto(),
    nombreap: Field.Text("nombreap", "Nombre").required(),
  }),
  contactoSummary: Schema("contactos", "codcontacto").fields({
    codContacto: Field.Text("codcontacto", "Cod. Contacto").auto(),
    nombre: Field.Text("nombre", "Nombre").required(),
    email: Field.Text("email", "E-mail").required(),
    telefono: Field.Text("telefono1", "Teléfono"),
    codpostal: Field.Text("codpostal", "Código postal"),
    numTratos: Field.Text("num_tratos", "Tratos").default(0),
    sumValor: Field.Text("sum_valor", "Valor").default(0),
    direccion: Field.Text("direccion", "Dirección"),
    ciudad: Field.Text("ciudad", "Ciudad"),
    cliente: Field.Text("codcliente", "Cliente"),
    agente: Field.Text("codagente", "Agente"),
    enlista: Field.Text("enlista", "En lista").dump(false),
    datosRevisados: Field.Bool("datosrevisados", "Datos de contacto revisados").default(false),
  }),
  interaccion: Schema("sh_timelinecontacto", "idtimelinecontacto").fields({
    idInteraccion: Field.Int("idtimelinecontacto", "ID"),
    tipo: Field.Text("tipo", "Tipo"),
    fecha: Field.Date("fecha", "Fecha"),
    codevento: Field.Text("codevento", "Evento"),
    codContacto: Field.Text("codcontacto", "Cod. Contacto"),
    nombreContacto: Field.Text("nombrecontacto", "Nombre Contacto"),
  }),
  contactoInteraccionCursos: Schema("sh_timelinecontacto", "idtimelinecontacto")
    .fields({
      codContacto: Field.Text("codcontacto", "Cod. Contacto"),
      nombre: Field.Text("nombrecontacto", "Nombre Contacto"),
      codUltimoEvento: Field.Text("codultimoevento", "Código última interaccion"),
      nombreUltimoEvento: Field.Text("nombreultimoevento", "Nombre última interaccion"),
      fechaUltimoEvento: Field.Date("fechaultimoevento", "Fecha última interaccion"),
    })
    .order(() => ({ field: "fechaultimoevento", direction: "DESC" })),
  // .limit(1000),
  contactoInteraccionActivo: Schema("sh_timelinecontacto", "idtimelinecontacto")
    .fields({
      codContacto: Field.Text("codcontacto", "Cod. Contacto"),
      nombre: Field.Text("nombrecontacto", "Nombre Contacto"),
      numEventos: Field.Int("totalinteracciones", "Número de eventos"),
    })
    .order(() => ({ field: "totalinteracciones", direction: "DESC" })),
  evento: Schema("eventos", "codevento").fields({
    codEvento: Field.Text("codevento", "Cod. Evento").auto(),
    nombre: Field.Text("nombre", "Nombre").required(),
    fechaIni: Field.Date("fechaini", "Fecha inicio").required(),
    horaIni: Field.Text("horaini", "Hora inicio").required(),
    fechaFin: Field.Date("fechafin", "Fecha fin").required(),
    horaFin: Field.Text("horafin", "Hora fin").required(),
    codDir: Field.Text("coddir", "Cod. Dirección"),
    codCliente: Field.Text("codcliente", "codcliente"),
    nombreCliente: Field.Text("nombrecliente", "Nombre cliente"),
    codAlmacen: Field.Text("codalmacen", "codalmacen"),
    nombreAlmacen: Field.Text("nombrealmacen", "Nombre almacen"),
  }),
  eventosContacto: Schema("eventos", "codevento").fields({
    codEvento: Field.Text("codevento", "Cod. Evento").auto(),
    nombre: Field.Text("nombre", "Nombre").required(),
    fechaIni: Field.Date("fechaini", "Fecha inicio").required(),
    horaIni: Field.Text("horaini", "Hora inicio").required(),
    fechaFin: Field.Date("fechafin", "Fecha fin").required(),
    horaFin: Field.Text("horafin", "Hora fin").required(),
    codDir: Field.Text("coddir", "Cod. Dirección"),
    codCliente: Field.Text("codcliente", "codcliente"),
    codAlmacen: Field.Text("codalmacen", "codalmacen"),
  }),
  lineaseventos: Schema("lineaseventos", "idlinea").fields({
    idlineaEvento: Field.Int("idlinea", "ID").auto(),
    codEvento: Field.Text("codevento", "codevento").required(),
    referencia: Field.Text("referencia", "Referencia").required(),
    descripcion: Field.Text("descripcion", "Descripcion"),
    cantidad: Field.Int("cantidad", "Cantidad"),
  }),
  trato: Schema("ss_tratos", "idtrato")
    .fields({
      idTrato: Field.Int("idtrato", "ID").auto(),
      titulo: Field.Text("titulo", "Título").required().length(100),
      valor: Field.Float("valor", "Valor").default(0),
      contacto: Field.Text("codcontacto", "Contacto").validation(trato =>
        trato.idTipotrato === util.getUser().tratolicenciafarma
          ? !trato.contacto && {
            error: true,
            message: "Campo requerido para este tipo de trato",
          }
          : !trato.cliente &&
          !trato.contacto && {
            error: true,
            message: "No tienes permisos para usar este tipo de trato",
          },
      ),
      cliente: Field.Text("codcliente", "Cliente").validation(
        trato =>
          trato.idTipotrato === util.getUser().tratolicenciafarma &&
          !trato.cliente && {
            error: true,
            message: "Campo requerido para este tipo de trato",
          },
      ),
      cifNifCliente: Field.Text("cifnif", "CIF/NIF"),
      etiquetaAc: Field.Bool("etiquetaac", "AC"),
      estado: Field.Options("estado", "Estado")
        .default("-")
        .options([
          { key: "Ganado", value: "Ganado" },
          { key: "Perdido", value: "Perdido" },
          { key: "-", value: "-" },
        ]),
      idTipotrato: Field.Options("idtipotrato", "ID Tipo Trato").validation(trato =>
        !trato.idTipotrato
          ? {
            error: true,
            message: "Campo requerido",
          }
          : trato.idTipotrato === util.getUser().tratolicenciafarma &&
          !ACL.can("crm.trato.farma") && {
            error: true,
            message: "No tienes permisos para usar este tipo de trato",
          },
      ),
      tipotrato: Field.Text("tipotrato", "Tipo").dump(false),
      fecha: Field.Date("fecha", "Fecha").required(),
      horaAlta: Field.Time("horaalta", "Hora alta").required(),
      fechaCierre: Field.Date("fechacierre", "Fecha cierre"),
      codAgente: Field.Text("codagente", "Agente").dump(_ =>
        util.getGlobalSetting("user_data").user.agente
          ? util.getGlobalSetting("user_data").user.agente
          : null,
      ),
      nombreAgente: Field.Text("nombreagente", "Nombre Agente").dump(false),
      nombreContacto: Field.Text("nombrecontacto", "Nombre Contacto").dump(false),
      nombreCliente: Field.Text("nombrecliente", "Nombre Cliente").dump(false),
      estadoAsigAgente: Field.Text("estadoasigagente", "Estado asignación agente"),
      idCampania: Field.Int("idcampania", "Id campaña"),
      idPerdida: Field.Int("idperdida", "Id perdida"),
      descripcionPerdida: Field.Text("descripcionperdida", "Descripción perdida trato"),
      idPresupuesto: Field.Int("idpresupuesto", "Id presupuesto"),
      codPresupuesto: Field.Text("codpresupuesto", "Cod. Presupuesto"),
      idPedido: Field.Int("idpedido", "Id pedido"),
      codPedido: Field.Text("codpedido", "Cod. Pedido").dump(false),
      exigirGenerarPedido: Field.Bool("exigirgenerarpedido", "Exigir generar pedido").dump(false),
      idLicencia: Field.Int("idlicencia", "Id licencia"),
      fechaLicenciaCaducidad: Field.Date("fechacaducidad", "Fecha de caducidad").load(() =>
        util.today(),
      ),
      fechaLicenciaFin: Field.Date("fechafin", "Fecha aprobación o rechazo").load(() =>
        util.today(),
      ),
      familias: Field.Options("familias", "Familias de productos")
        .load(campania =>
          campania.familias
            ? campania.familias?.split?.(";").map(familia => !!familia && JSON.parse(familia))
            : [],
        )
        .dump(campania =>
          Array.isArray(campania.familias)
            ? campania.familias.map(familia => JSON.stringify(familia)).join(";")
            : campania.familias,
        ),
    })
    .filter(data => (data?.codContacto ? ["codcontacto", "eq", data?.codContacto] : null))
    .order(() => ({ field: "fecha", direction: "DESC" })),
  // .order(() => ({ field: "estado", direction: "ASC" })),
  tratoFarma: Schema("ss_tratos", "idtrato")
    .fields({
      idTrato: Field.Int("idtrato", "ID").auto(),
      titulo: Field.Text("titulo", "Título").required().length(100),
      valor: Field.Float("valor", "Valor").default(0),
      contacto: Field.Text("codcontacto", "Contacto").validation(trato =>
        trato.idTipotrato === util.getUser().tratolicenciafarma
          ? !trato.contacto && {
            error: true,
            message: "Campo requerido para este tipo de trato",
          }
          : !trato.cliente &&
          !trato.contacto && {
            error: true,
            message: "No tienes permisos para usar este tipo de trato",
          },
      ),
      cliente: Field.Text("codcliente", "Cliente").validation(
        trato =>
          trato.idTipotrato === util.getUser().tratolicenciafarma &&
          !trato.cliente && {
            error: true,
            message: "Campo requerido para este tipo de trato",
          },
      ),
      cifNifCliente: Field.Text("cifnif", "CIF/NIF"),
      etiquetaAc: Field.Bool("etiquetaac", "AC"),
      estado: Field.Options("estado", "Estado")
        .default("-")
        .options([
          { key: "Ganado", value: "Ganado" },
          { key: "Perdido", value: "Perdido" },
          { key: "-", value: "-" },
        ]),
      idTipotrato: Field.Options("idtipotrato", "ID Tipo Trato").validation(trato =>
        !trato.idTipotrato
          ? {
            error: true,
            message: "Campo requerido",
          }
          : trato.idTipotrato === util.getUser().tratolicenciafarma &&
          !ACL.can("crm.trato.farma") && {
            error: true,
            message: "No tienes permisos para usar este tipo de trato",
          },
      ),
      tipotrato: Field.Text("tipotrato", "Tipo").dump(false),
      fecha: Field.Date("fecha", "Fecha").required(),
      fechaCierre: Field.Date("fechacierre", "Fecha cierre"),
      codAgente: Field.Text("codagente", "Agente").dump(_ =>
        util.getGlobalSetting("user_data").user.agente
          ? util.getGlobalSetting("user_data").user.agente
          : null,
      ),
      nombreAgente: Field.Text("nombreagente", "Nombre Agente").dump(false),
      nombreContacto: Field.Text("nombrecontacto", "Nombre Contacto").dump(false),
      nombreCliente: Field.Text("nombrecliente", "Nombre Cliente").dump(false),
      estadoAsigAgente: Field.Text("estadoasigagente", "Estado asignación agente"),
      idCampania: Field.Int("idcampania", "Id campaña"),
      idPerdida: Field.Int("idperdida", "Id perdida"),
      descripcionPerdida: Field.Text("descripcionperdida", "Descripción perdida trato"),
      idPresupuesto: Field.Int("idpresupuesto", "Id presupuesto"),
      codPresupuesto: Field.Text("codpresupuesto", "Cod. Presupuesto"),
      idPedido: Field.Int("idpedido", "Id pedido"),
      codPedido: Field.Text("codpedido", "Cod. Pedido").dump(false),
      exigirGenerarPedido: Field.Bool("exigirgenerarpedido", "Exigir generar pedido").dump(false),
      idLicencia: Field.Int("idlicencia", "Id licencia"),
      fechaLicenciaCaducidad: Field.Date("fechacaducidad", "Fecha de caducidad").load(() =>
        util.today(),
      ),
      fechaLicenciaFin: Field.Date("fechafin", "Fecha aprobación o rechazo").load(() =>
        util.today(),
      ),
      familias: Field.Options("familias", "Familias de productos")
        .load(campania =>
          campania.familias
            ? campania.familias?.split?.(";").map(familia => !!familia && JSON.parse(familia))
            : [],
        )
        .dump(campania =>
          Array.isArray(campania.familias)
            ? campania.familias.map(familia => JSON.stringify(familia)).join(";")
            : campania.familias,
        ),
    })
    .filter(data => (data?.codContacto ? ["codcontacto", "eq", data?.codContacto] : null))
    .order(() => ({ field: "fecha", direction: "DESC" })),
  // .order(() => ({ field: "estado", direction: "ASC" })),
  tratoCampania: Schema("ss_tratos", "idtrato")
    .fields({
      idTrato: Field.Int("idtrato", "ID").auto(),
      idCampania: Field.Int("idcampania", "Id campaña"),
      titulo: Field.Text("titulo", "Título").required().length(100),
      valor: Field.Float("valor", "Valor").default(0),
      contacto: Field.Text("codcontacto", "Contacto"),
      cliente: Field.Text("codcliente", "Contacto"),
      estado: Field.Options("estado", "Estado")
        .default("-")
        .options([
          { key: "Ganado", value: "Ganado" },
          { key: "Perdido", value: "Perdido" },
          { key: "-", value: "-" },
        ]),
      idTipotrato: Field.Options("idtipotrato", "ID Tipo Trato").validation(trato =>
        !trato.idTipotrato
          ? {
            error: true,
            message: "Campo requerido",
          }
          : trato.idTipotrato === util.getUser().tratolicenciafarma &&
          !ACL.can("crm.trato.farma") && {
            error: true,
            message: "No tienes permisos para usar este tipo de trato",
          },
      ),
      tipotrato: Field.Text("tipotrato", "Tipo").dump(false),
      tipoCampania: Field.Text("tipocampania", "Tipo campaña").dump(false),
      fecha: Field.Date("fecha", "Fecha").required(),
      horaAlta: Field.Time("horaalta", "Hora alta").required(),
      fechaCierre: Field.Date("fechacierre", "Fecha cierre"),
      codAgente: Field.Text("codagente", "Agente"),
      nombreAgente: Field.Text("nombreagente", "Nombre Agente").dump(false),
      nombreContacto: Field.Text("nombrecontacto", "Nombre Contacto").dump(false),
      nombreCliente: Field.Text("nombrecliente", "Nombre Cliente").dump(false),
      emailContacto: Field.Text("emailcontacto", "Email Contacto").dump(false),
      telefonoContacto: Field.Text("telefonocontacto", "Telefono Contacto").dump(false),
      emailCliente: Field.Text("emailcliente", "Email Cliente").dump(false),
      telefonoCliente: Field.Text("telefonocliente", "Telefono Cliente").dump(false),
      estadoAsigAgente: Field.Text("estadoasigagente", "Estado asignación agente"),
      idPerdida: Field.Int("idperdida", "Id perdida"),
      descripcionPerdida: Field.Text("descripcionperdida", "Descripción perdida trato"),
      idContactoCampania: Field.Int("idcontactocampania", "Id Contacto por campaña"),
      idPresupuesto: Field.Int("idpresupuesto", "Id presupuesto"),
      codPresupuesto: Field.Text("codpresupuesto", "Cod. Presupuesto"),
      idPedido: Field.Int("idpedido", "Id pedido"),
      codPedido: Field.Text("codpedido", "Cod. Pedido"),
      idLicencia: Field.Int("idlicencia", "Id licencia"),
      fechaLicenciaCaducidad: Field.Date("fechacaducidad", "Fecha de caducidad").load(() =>
        util.today(),
      ),
      fechaLicenciaFin: Field.Date("fechafin", "Fecha aprobación o rechazo").load(() =>
        util.today(),
      ),
      etiquetaAC: Field.Bool("etiquetaac", "AC"),
      exigirGenerarPedido: Field.Bool("exigirgenerarpedido", "Exigir generar pedido").dump(false),
      familias: Field.Options("familias", "Familias de productos")
        .load(campania =>
          campania.familias
            ? campania.familias?.split?.(";").map(familia => !!familia && JSON.parse(familia))
            : [],
        )
        .dump(campania =>
          Array.isArray(campania.familias)
            ? campania.familias.map(familia => JSON.stringify(familia)).join(";")
            : campania.familias,
        ),
    })
    .filter(data => (data?.codContacto ? ["codcontacto", "eq", data?.codContacto] : null))
    // .filter(({ pedido }) => ["idpedido", "eq", pedido.data.idPedido]),
    //.order(() => ({ field: "estado", direction: "ASC" })),
    .order(() => ({ field: "fecha", direction: "DESC" })),
  tratoTarea: Schema("ss_tratos", "idtrato").fields({
    idTrato: Field.Int("idtrato", "ID").auto(),
    idCampania: Field.Int("idcampania", "Id campaña"),
    contacto: Field.Text("codcontacto", "Contacto"),
    cliente: Field.Text("codcliente", "Cliente"),
    estado: Field.Options("estado", "Estado")
      .default("-")
      .options([
        { key: "Ganado", value: "Ganado" },
        { key: "Perdido", value: "Perdido" },
        { key: "-", value: "-" },
      ]),
    idTipotrato: Field.Options("idtipotrato", "ID Tipo Trato").validation(trato =>
      !trato.idTipotrato
        ? {
          error: true,
          message: "Campo requerido",
        }
        : trato.idTipotrato === util.getUser().tratolicenciafarma &&
        !ACL.can("crm.trato.farma") && {
          error: true,
          message: "No tienes permisos para usar este tipo de trato",
        },
    ),
    tipotrato: Field.Text("tipotrato", "Tipo").dump(false),
    codAgente: Field.Text("codagente", "Agente"),
    estadoAsigAgente: Field.Text("estadoasigagente", "Estado asignación agente"),
    idPerdida: Field.Int("idperdida", "Id perdida"),
    descripcionPerdida: Field.Text("descripcionperdida", "Descripción perdida trato"),
    idContactoCampania: Field.Int("idcontactocampania", "Id Contacto por campaña"),
    idPresupuesto: Field.Int("idpresupuesto", "Id presupuesto"),
    codPresupuesto: Field.Text("codpresupuesto", "Cod. Presupuesto"),
    idPedido: Field.Int("idpedido", "Id pedido"),
    codPedido: Field.Text("codpedido", "Cod. Pedido"),
    idLicencia: Field.Int("idlicencia", "Id licencia"),
    fechaLicenciaCaducidad: Field.Date("fechacaducidad", "Fecha de caducidad").load(() =>
      util.today(),
    ),
    fechaLicenciaFin: Field.Date("fechafin", "Fecha aprobación o rechazo").load(() => util.today()),
    exigirGenerarPedido: Field.Bool("exigirgenerarpedido", "Exigir generar pedido").dump(false),
    ultimaTarea: Field.Text("ultimatarea", "Última tarea").dump(false),
  }),
  // .filter(data => (data?.codContacto ? ["codcontacto", "eq", data?.codContacto] : null))
  // .order(() => ({ field: "fecha", direction: "DESC" })),
  tratosCliente: Schema("ss_tratos", "idtrato")
    .fields({
      idTrato: Field.Int("idtrato", "ID").auto(),
      titulo: Field.Text("titulo", "Título"),
      idCampania: Field.Int("idcampania", "Id campaña"),
      idTipotrato: Field.Int("idtipotrato", "Id tipotrato"),
      fecha: Field.Date("fecha", "Fecha"),
      tipotrato: Field.Text("tipotrato", "Tipo"),
      cliente: Field.Text("codcliente", "Cliente"),
    })
    .filter(data => (data?.codCliente ? ["codcliente", "eq", data?.codCliente] : null))
    .order(() => ({ field: "fecha", direction: "DESC" })),
  tarea: Schema("ss_tareas", "idtarea")
    .fields({
      idTarea: Field.Int("idtarea", "ID").auto(),
      titulo: Field.Text("titulo", "Título").required().length(100),
      fecha: Field.Date("fecha", "Fecha").default(util.today()).required(),
      hora: Field.Time("hora", "Hora")
        .load(t => t?.hora?.substring(0, 5))
        .default(util.now())
        .required(),
      // fechaFin: Field.Date("fechafin", "Fecha finalización"),
      // horaFin: Field.Time("horafin", "Hora finalización").load(t => t?.horafin?.substring(0, 5)),
      fechaFin: Field.Date("fechafin", "Fecha finalización").default(util.today()).required(),
      horaFin: Field.Time("horafin", "Hora finalización")
        .load(t => t?.horafin?.substring(0, 5))
        .default(util.now())
        .required(),
      latitudFin: Field.Float("latitudfin", "Coordenada latitud finalización"),
      longitudFin: Field.Float("longitudfin", "Coordenada longitud finalización"),
      tipo: Field.Options("tipo", "Tipo")
        .required()
        .default("Llamada")
        .options([
          { key: "Llamada", value: "Llamada" },
          { key: "Email", value: "Email" },
          { key: "Whatsapp", value: "Whatsapp" },
          { key: "Cita", value: "Cita" },
        ]),
      completada: Field.Bool("completada", "Completada").default(false),
      nota: Field.Text("nota", "Nota").default(""),
      idTrato: Field.Text("idtrato", "Trato"),
      codIncidencia: Field.Text("codincidencia", "Incidencia"),
      codAgente: Field.Text("codagente", "Agente").dump(
        _ => util.getGlobalSetting("user_data").user.agente,
      ),
      codAgenteObservador: Field.Text("codagenteobservador", "Agente obervador trato").dump(false),
      codContacto: Field.Text("codcontacto", "Contacto").dump(false),
      codCliente: Field.Text("codcliente", "Contacto").dump(false),
      codClienteIncidencia: Field.Text("codclienteincidencia", "Cliente incidencia"),
      nombreAgente: Field.Text("nombreagente", "Nombre Agente").dump(false),
      tituloTrato: Field.Text("titulotrato", "Título Trato").dump(false),
      nombreContacto: Field.Text("nombrecontacto", "Nombre Contacto").dump(false),
      telefonoContacto: Field.Text("telefonocontacto", "Telf. Contacto").dump(false),
      emailContacto: Field.Text("emailcontacto", "Email Contacto").dump(false),
    })
    .filter(data => (data?.idTrato ? ["idtrato", "eq", data?.idTrato] : null))
    .order(() => ({ field: "fecha", direction: "DESC" })),
  tareasCliente: Schema("ss_tareas", "idtarea")
    .fields({
      idTarea: Field.Int("idtarea", "ID").auto(),
      titulo: Field.Text("titulo", "Título"),
      tituloTrato: Field.Text("titulotrato", "Título Trato"),
      fecha: Field.Date("fecha", "Fecha"),
      hora: Field.Time("hora", "Hora")
        .load(t => t?.hora?.substring(0, 5)),
      tipo: Field.Options("tipo", "Tipo")
        .default("Llamada")
        .options([
          { key: "Llamada", value: "Llamada" },
          { key: "Email", value: "Email" },
          { key: "Whatsapp", value: "Whatsapp" },
          { key: "Cita", value: "Cita" },
        ]),
      completada: Field.Bool("completada", "Completada").default(false),
      nota: Field.Text("nota", "Nota").default(""),
      idTrato: Field.Text("idtrato", "Trato"),
    })
    .order(() => ({ field: "fecha", direction: "DESC" })),
  nuevaTarea: Schema("ss_tareas", "idtarea")
    .fields({
      idTarea: Field.Int("idtarea", "ID").auto(),
      titulo: Field.Text("titulo", "Título").required().length(100),
      fecha: Field.Date("fecha", "Fecha").default(util.today()).required(),
      hora: Field.Time("hora", "Hora")
        .load(t => t?.hora?.substring(0, 5))
        .default(util.now())
        .required(),
      tipo: Field.Options("tipo", "Tipo")
        .required()
        .default("Llamada")
        .options([
          { key: "Llamada", value: "Llamada" },
          { key: "Email", value: "Email" },
          { key: "Whatsapp", value: "Whatsapp" },
          { key: "Cita", value: "Cita" },
        ]),
      completada: Field.Bool("completada", "Completada").default(false),
      nota: Field.Text("nota", "Nota").default(""),
      idTrato: Field.Text("idtrato", "Trato"),
      codAgente: Field.Text("codagente", "Agente").dump(
        _ => util.getGlobalSetting("user_data").user.agente,
      ),
      codIncidencia: Field.Text("codincidencia", "Incidencia"),
    })
    .filter(data => (data?.idTrato ? ["idtrato", "eq", data?.idTrato] : null))
    .order(() => ({ field: "fecha", direction: "DESC" })),
  tareaContacto: Schema("ss_tareas", "idtarea")
    .fields({
      idTarea: Field.Int("idtarea", "ID").auto(),
      titulo: Field.Text("titulo", "Título").required(),
      fecha: Field.Date("fecha", "Fecha").default(util.today()),
      hora: Field.Time("hora", "Hora")
        .load(t => t?.hora?.substring(0, 5))
        .default(util.now()),
      fechaFin: Field.Date("fechafin", "Fecha finalización").default(util.today()).required(),
      horaFin: Field.Time("horafin", "Hora finalización")
        .load(t => t?.horafin?.substring(0, 5))
        .default(util.now())
        .required(),
      tipo: Field.Text("tipo", "Tipo").required().default("Llamada"),
      completada: Field.Bool("completada", "Completada").default(false),
      idTrato: Field.Text("idtrato", "Trato").required(),
      codAgente: Field.Text("codagente", "Agente").dump(
        _ => util.getGlobalSetting("user_data").user.agente,
      ),
      telefonoContacto: Field.Text("telefonocontacto", "Telf. Contacto").dump(false),
      emailContacto: Field.Text("emailcontacto", "Email Contacto").dump(false),
    })
    .filter(data => (data?.codContacto ? ["codcontacto", "eq", data?.codContacto] : null)),
  // .order(() => ({ field: 'fecha', direction: 'DESC' })),
  tareasAgente: Schema("ss_tareas", "codagente").fields({}),
  notaContacto: Schema("contactos", "codcontacto")
    .fields({
      idNota: Field.Int("idnota", "ID").auto(),
      codContacto: Field.Text("codcontacto", "Contacto").required(),
      texto: Field.Text("texto", "Texto").required(),
      fecha: Field.Date("fecha", "Fecha").required(),
    })
    // .filter(contacto => ["codcontacto", "eq", contacto.codContacto])
    .order(() => ({ field: "fecha", direction: "ASC" })),
  notaTrato: Schema("ss_tratos", "idtrato")
    .fields({
      idNota: Field.Int("idnota", "ID").auto(),
      idTrato: Field.Text("idtrato", "Trato").required(),
      texto: Field.Text("texto", "Texto").required(),
      fecha: Field.Date("fecha", "Fecha").required(),
    })
    .filter(trato => ["idtrato", "eq", trato.idTrato])
    .order(() => ({ field: "fecha", direction: "ASC" })),
  progreso: Schema("usuarios", "idusuario").fields({
    porcentaje: Field.Int("porcentaje", "Porcentaje"),
    incremento: Field.Float("incremento", "Incremento"),
    totalVentas: Field.Float("totalventas", "Total Ventas"),
  }),
  totalesTratos: Schema("ss_tratos", "idtrato").fields({
    total: Field.Int("total", "Total"),
    ganados: Field.Float("ganados", "Ganados"),
    perdidos: Field.Float("perdidos", "Perdidos"),
  }),
  tipotrato: Schema("ss_tipostrato", "idtipotrato").fields({
    id: Field.Int("idtipotrato", "ID").auto(),
    tipo: Field.Text("tipo", "Tipo"),
    avisoAgentePorDefecto: Field.Bool("avisoagentepordefecto", "Agente").default(false),
    exigirGenerarPedido: Field.Bool("exigirgenerarpedido", "Exigir generar pedido").default(false),
    tareaInicialTrato: Field.Text("tareainicialtrato", "Tarea Inicial").default("Ninguna"),
  }),
  contactosAgente: Schema("ss_contactos_agente", "id").fields({
    contacto: Field.Text("contacto", "Contacto"),
    agente: Field.Text("agente", "Agente"),
  }),
  graficoHistoricoPrevision: Schema("ss_graficos", "id").fields({
    xAxis: Field.Text("x_axis", "X axis").load(false),
    yAxis: Field.Text("y_axis", "Y axis").load(false),
    fechaInicio: Field.Date("fecha_inicio", "Fecha Inicio").dump(false),
    fechaFin: Field.Date("fecha_fin", "Fecha Fin").dump(false),
    codFamilia: Field.Text("familia", "Familia").dump(false),
    codSubfamilia: Field.Text("subfamilia", "Subfamilia").dump(false),
  }),
  graficoGeolocalizacion: Schema("ss_graficos", "id").fields({
    locations: Field.Text("locations", "locations").load(false),
    center: Field.Text("center", "center").load(false),
    zoom: Field.Text("zoom", "zoom").load(false),
    fechaDesde: Field.Date("fechaDesde", "fechaDesde").dump(false),
    fechaHasta: Field.Date("fechaHasta", "fechaHasta").dump(false),
    codCliente: Field.Text("codCliente", "codCliente").dump(false),
    ref1: Field.Text("ref1", "ref1").dump(false),
    ref2: Field.Text("ref2", "ref2").dump(false),
    ref3: Field.Text("ref3", "ref3").dump(false),
    minFacturacion: Field.Int("minFacturacion", "minFacturacion").dump(false),
    coordinates: Field.Text("coordinates", "coordinates").dump(false),
    centerlat: Field.Float("centerlat", "centerlat").dump(false),
    centerlon: Field.Float("centerlon", "centerlon").dump(false),
    width: Field.Float("width", "width").dump(false),
    height: Field.Float("height", "height").dump(false),
  }),
  familia: Schema("familias", "codfamilia").fields({
    codigo: Field.Text("codfamilia", "Cod. Familia").auto(),
    descripcion: Field.Text("descripcion", "Descripcion"),
  }),
  subfamilia: Schema("subfamilias", "codsubfamilia").fields({
    codigo: Field.Text("codsubfamilia", "Cod. Subfamilia").auto(),
    descripcion: Field.Text("descripcion", "Descripcion"),
  }),
  recomProducto: Schema("ss_recomendaciones", "parentref").fields({
    parentRef: Field.Text("parentref", "Referencia"),
    referencia: Field.Text("referencia", "Referencia"),
    codPadre: Field.Text("codpadre", "Referencia"),
    descripcion: Field.Text("descripcion", "Descripción"),
    nombrePadre: Field.Text("nombrepadre", "Descripción"),
    codSubfamilia: Field.Text("codsubfamilia", "codsubfamilia"),
    codCliente: Field.Text("codcliente", "codcliente"),
    codDir: Field.Text("coddir", "coddir"),
    score: Field.Float("score", "Score"),
  }),
  recomSubfamilia: Schema("ss_recomendaciones", "codsubfamilia").fields({
    codsubfamilia: Field.Text("codsubfamilia", "codsubfamilia"),
    descripcion: Field.Text("descripcion", "descripcion"),
  }),
  recomSubfamiliaByCliente: Schema("ss_recomendaciones", "codsubfamilia")
    .fields({
      codsubfamilia: Field.Text("codsubfamilia", "codsubfamilia"),
      descripcion: Field.Text("descripcion", "descripcion"),
      score: Field.Float("score", "Score"),
      products: Field.Options("products", "Productos"),
    })
    .order(() => ({ field: "score", direction: "DESC" })),
  recomCliente: Schema("ss_recomendaciones", "codcliente").fields({
    codCliente: Field.Text("codcliente", "Cliente"),
    nombre: Field.Text("nombre", "Nombre"),
    email: Field.Text("email", "E-mail"),
    telefono: Field.Text("telefono", "Teléfono"),
  }),
  dirClientes: Schema("dirclientes", "id").fields({
    codDir: Field.Int("id", "codDir").default(null),
    codCliente: Field.Text("codcliente", "Cód. Cliente"),
    direccion: Field.Text("direccion", "Dirección").required(),
    ciudad: Field.Text("ciudad", "Población").required(),
    provincia: Field.Text("provincia", "Provincia"),
    codPais: Field.Text("codpais", "Cód. País"),
    codPostal: Field.Text("codpostal", "Cód. Postal"),
    dirTipoVia: Field.Text("dirtipovia", "T. Vía"),
    dirNum: Field.Text("dirnum", "Núm."),
    dirOtros: Field.Text("dirotros", "Otros"),
  }),
  recomClienteBySubfamilia: Schema("ss_recomendaciones", "codcliente")
    .fields({
      codCliente: Field.Text("codcliente", "Cod Cliente"),
      codDir: Field.Text("coddir", "Cod Direccion"),
      nombre: Field.Text("nombre", "Nombre"),
      email: Field.Text("email", "E-mail"),
      telefono: Field.Text("telefono", "Teléfono"),
      dirTipoVia: Field.Text("dirtipovia", "dirTipoVia"),
      direccion: Field.Text("direccion", "direccion"),
      dirNum: Field.Text("dirnum", "dirnum"),
      codPostal: Field.Text("codpostal", "codPostal"),
      ciudad: Field.Text("ciudad", "ciudad"),
      provincia: Field.Text("provincia", "provincia"),
      score: Field.Float("score", "Score"),
      products: Field.Options("products", "Productos"),
    })
    .order(() => ({ field: "score", direction: "DESC" })),
  recomAll: Schema("ss_recomendaciones", "codcliente").fields({
    codCliente: Field.Text("codcliente", "Cod Cliente"),
    codDir: Field.Text("coddir", "Cod Direccion"),
    nombre: Field.Text("nombre", "Nombre"),
    email: Field.Text("email", "E-mail"),
    telefono: Field.Text("telefono", "Teléfono"),
    dirTipoVia: Field.Text("dirtipovia", "dirTipoVia"),
    direccion: Field.Text("direccion", "direccion"),
    dirNum: Field.Text("dirnum", "dirnum"),
    codPostal: Field.Text("codpostal", "codPostal"),
    ciudad: Field.Text("ciudad", "ciudad"),
    provincia: Field.Text("provincia", "provincia"),
    subfamilias: Field.Options("subfamilias", "subfamilias"),
  }),
  graficos: Schema("ss_graficos", "graf").fields({
    name: Field.Text("name", "name").load(false),
    graphs: Field.Options("graphs", "graphs").load(false),
    filter: Field.Options("filter", "filter").load(false),
    data: Field.Options("data", "data").dump(false),
  }),
  filtroGraficos: Schema("ss_graficos", "graf").fields({
    fecha: Field.Date("fact_fecha", "Fecha"),
    agente: Field.Text("fact_agente", "Agente"),
    familia: Field.Text("art_codfamilia", "Familia"),
    comunidad: Field.Int("ca_idcomunidad", "Comunidad Autónoma"),
  }),
  filtroGraficoRecomendaciones: Schema("ss_graficos", "graf").fields({
    clientes: Field.Text("recom_codcliente", "Clientes"),
    scoreTreshold: Field.Int("recom_score", "Score Treshold"),
  }),
  campania: Schema("ss_campanias", "idcampania")
    .fields({
      idCampania: Field.Int("idcampania", "ID").auto(),
      nombre: Field.Text("nombre", "Nombre").required(),
      fechaAlta: Field.Date("fechaalta", "F. Alta").default(util.today()),
      idTipoTrato: Field.Int("idtipotrato", "Tipo de trato por defecto"),
      tipoTrato: Field.Text("tipotrato", "Tipo").dump(false),
      codAgenteTratos: Field.Text("codagentetratos", "Agente Trato"),
      nombreAgenteTratos: Field.Text("nombreagentetratos", "Nombre agente Trato").dump(false),
      avisoAgenteTratosPorDefecto: Field.Text(
        "avisoagentetratospordefecto",
        "Agente por defecto",
      ).dump(false),
      ratioConversion: Field.Float("ratioconversion", "Ratio de conversión de tratos").dump(false),
      valorTratos: Field.Currency("valortratos", "valor de tratos").default(0),
      cuentaMarketing: Field.Text("cuentamarketing", "Cuenta marketing"),
      importeFacturadoMenorQue: Field.Currency(
        "importefacturadomenorque",
        "Importe facturado en el período menor que",
      ).default(0),
      importeFacturadoMayorQue: Field.Currency(
        "importefacturadomayorque",
        "Importe facturado en el período mayor que",
      ).default(0),
      tipo: Field.Options("tipo", "Tipo")
        .required()
        .default("repeticion")
        .options([
          { key: "repeticion", value: "Repetición" },
          { key: "captacion", value: "Captación" },
          { key: "medicion", value: "Medición" },
          { key: "ventaCruzada", value: "Venta Cruzada" },
          { key: "marketingDigital", value: "Marketing digital" },
        ]),
      estado: Field.Options("estado", "Estado")
        .default("pendiente")
        .options([
          { key: "pendiente", value: "Pendiente" },
          { key: "enseguimiento", value: "En seguimiento" },
          { key: "archivada", value: "Archivada" },
        ]),
      tipoProducto: Field.Options("tipoproducto", "Productos por")
        .required()
        .default("subfamilia")
        .options([
          { key: "subfamilia", value: "Subfamilia" },
          { key: "listadearticulos", value: "Lista de artículos" },
        ]),
      subfamilia: Field.Text("subfamilia", "Subfamilia").validation(
        campania =>
          campania.tipoProducto === "subfamilia" &&
          !campania.subfamilia && {
            error: true,
            message: "Campo requerido",
          },
      ),
      productos: Field.Options("productos", "Productos")
        .load(campania => {
          {
            if (!campania?.productos) {
              return {};
            }
            const obj = JSON.parse(campania?.productos);
            if (obj?.lista_incluidos) {
              obj.lista_incluidos.refs = obj.lista_incluidos.refs.split?.(";");
            }
            if (obj?.lista_excluidos) {
              obj.lista_excluidos.refs = obj.lista_excluidos.refs.split?.(";");
            }

            return obj;
          }
        })
        .dump(campania => {
          const obj = {};
          if (campania?.productos?.lista_incluidos?.refs?.length > 0) {
            obj["lista_incluidos"] = {
              tipo: campania.productos.lista_incluidos.tipo,
              refs: campania.productos.lista_incluidos.refs
                .map(ref => {
                  return ref.referencia;
                })
                .join(";"),
            };
          }
          if (campania?.productos?.lista_excluidos?.refs?.length > 0) {
            obj["lista_excluidos"] = {
              tipo: campania.productos.lista_excluidos.tipo,
              refs: campania.productos.lista_excluidos.refs
                .map(ref => {
                  return ref.referencia;
                })
                .join(";"),
            };
          }

          return JSON.stringify(obj);
        })
        .validation(
          campania =>
            campania.tipo !== "marketingDigital" &&
            campania.tipoProducto === "listadearticulos" &&
            (campania.productos?.lista_incluidos?.refs.length ?? 0) === 0 &&
            (campania.productos?.lista_excluidos?.refs.length ?? 0) === 0 && {
              error: true,
              message: "Campo requerido",
            },
        ),
      productosOfertar: Field.Options("productosofertar", "Productos a ofertar")
        .load(
          campania =>
            campania.productosofertar
              ?.split?.(";")
              .map(producto => !!producto && JSON.parse(producto)) ?? [],
        )
        .dump(campania =>
          Array.isArray(campania.productosOfertar)
            ? campania.productosOfertar.map(producto => JSON.stringify(producto)).join(";")
            : campania.productosOfertar,
        )
        .validation(
          campania =>
            campania.tipo === "ventaCruzada" &&
            (campania.productosOfertar?.length ?? 0) === 0 && {
              error: true,
              message: "Campo requerido",
            },
        ),
      fechaInicioImpacto: Field.Date("fechainicioimpacto", "F. Inicio Impacto")
        .required()
        .default(util.firstOfNextMonth()),
      fechaFinImpacto: Field.Date("fechafinimpacto", "F. Fin Impacto")
        .required()
        .default(util.lastOfYear()),
      fechaInicioUltimaCompra: Field.Date("fechainicioultimacompra", "F. Última compra")
        .required()
        .default(util.oneYearAgo()),
      fechaFinUltimaCompra: Field.Date("fechafinultimacompra", "F. Última compra")
        .required()
        .default(util.today()),
      diasDesdeUltimaCompra: Field.Int(
        "diasdesdeultimacompra",
        "Días desde la última compra",
      ).validation(
        campania =>
          campania.tipo === "repeticion" &&
          isNaN(campania.diasDesdeUltimaCompra) && {
            error: true,
            message: "Campo requerido",
          },
      ),
      tipoCaptacion: Field.Options("tipocaptacion", "Tipo de Captación")
        .options([
          { key: "leads", value: "Leads" },
          { key: "ventadirecta", value: "Venta directa" },
        ])
        .validation(
          campania =>
            campania.tipo === "captacion" &&
            !campania.tipoCaptacion && {
              error: true,
              message: "Campo requerido",
            },
        ),
      umbralRecomendacion: Field.Float("umbralrecomendacion", "Umbral de Recomendación").validation(
        campania =>
          campania.tipo === "captacion" &&
          isNaN(campania.umbralRecomendacion) && {
            error: true,
            message: "Campo requerido",
          },
      ),
      tratosTotales: Field.Text("tratostotales", "Tratos totales de campaña").dump(false),
    })
    .order(() => ({ field: "fechaalta", direction: "DESC" })),
  launchCampania: Schema("ss_campanias", "idcampania").fields({
    idCampania: Field.Int("idcampania", "ID"),
  }),
  generateContactosCampania: Schema("ss_campanias", "idcampania").fields({
    idCampania: Field.Int("idcampania", "ID"),
    fechaAlta: Field.Date("fechaalta", "F. Alta"),
    tipo: Field.Options("tipo", "Tipo"),
    tipoProducto: Field.Options("tipoproducto", "Productos por"),
    subfamilia: Field.Text("subfamilia", "Subfamilia"),
    productos: Field.Options("productos", "Productos").dump(campania => {
      const obj = {};
      if (campania?.productos?.lista_incluidos?.refs?.length > 0) {
        obj["lista_incluidos"] = {
          tipo: campania.productos.lista_incluidos.tipo,
          refs: campania.productos.lista_incluidos.refs
            .map(ref => {
              return ref.referencia;
            })
            .join(";"),
        };
      }
      if (campania?.productos?.lista_excluidos?.refs?.length > 0) {
        obj["lista_excluidos"] = {
          tipo: campania.productos.lista_excluidos.tipo,
          refs: campania.productos.lista_excluidos.refs
            .map(ref => {
              return ref.referencia;
            })
            .join(";"),
        };
      }

      return JSON.stringify(obj);
    }),
    diasDesdeUltimaCompra: Field.Int("diasdesdeultimacompra", "Días desde la última compra"),
    fechaInicioUltimaCompra: Field.Date("fechainicioultimacompra", "F. Última compra"),
    fechaFinUltimaCompra: Field.Date("fechafinultimacompra", "F. Última compra"),
    tipoCaptacion: Field.Options("tipocaptacion", "Tipo de Captación").options([
      { key: "leads", value: "Leads" },
      { key: "ventadirecta", value: "Venta directa" },
    ]),
    umbralRecomendacion: Field.Float("umbralrecomendacion", "Umbral de Recomendación"),
    numClientes: Field.Int("numclientes", "Número de clientes")
      .dump(false)
      .load(camp => camp?.numClientes ?? 0),
  }),
  graficosCampania: Schema("ss_campanias", "idcampania").fields({
    fechaInicioMedicion: Field.Date("fechainiciomedicion", "F. Inicio Medición"),
    fechaFinMedicion: Field.Date("fechafinmedicion", "F. Fin Medición"),
    fechaInicioComparacion: Field.Date("fechainiciocomparacion", "F. Inicio Comparación"),
    fechaFinComparacion: Field.Date("fechafincomparacion", "F. Fin Comparación"),
    productos: Field.Options("productos", "Productos").dump(campania => {
      const obj = {};
      if (campania?.productos?.lista_incluidos?.refs?.length > 0) {
        obj["lista_incluidos"] = {
          tipo: campania.productos.lista_incluidos.tipo,
          refs: campania.productos.lista_incluidos.refs.join(";"),
        };
      }
      if (campania?.productos?.lista_excluidos?.refs?.length > 0) {
        obj["lista_excluidos"] = {
          tipo: campania.productos.lista_excluidos.tipo,
          refs: campania.productos.lista_excluidos.refs.join(";"),
        };
      }

      return JSON.stringify(obj);
    }),
    tipoProducto: Field.Options("tipoproducto", "Productos por"),
    subfamilia: Field.Text("subfamilia", "Subfamilia"),
    name: Field.Text("name", "name"),
  }),
  causasPerdidaTrato: Schema("ss_causasperdidatrato", "idperdida")
    .fields({
      idPerdida: Field.Int("idperdida", "ID").auto(),
      idTipoTrato: Field.Text("idtipotrato", "Tipo trato").required(),
      descripcion: Field.Text("descripcion", "descripcion").required(),
    })
    .filter(trato => ["idtipotrato", "eq", trato.id])
    .order(() => ({ field: "idperdida", direction: "ASC" }))
    .limit(100),
  articulo: Schema("articulos", "referencia")
    .fields({
      referencia: Field.Text("referencia", "Referencia"),
      descripcion: Field.Text("descripcion", "Descripción"),
    })
    .limit(10000),
  contactosPorCampania: Schema("ss_contactosporcampania", "idcontacto").fields({
    idContacto: Field.Int("idcontacto", "ID").auto(),
    idCampania: Field.Int("idcampania", "Campaña"),
    telefono: Field.Text("telefono", "Telefono"),
    email: Field.Text("email", "email"),
    codPostal: Field.Text("codpostal", "Cod. Postal"),
    nombre: Field.Text("nombre", "Nombre"),
    ciudad: Field.Text("ciudad", "Ciudad"),
  }),
  dirAutoClientes: Schema("ss_tratos", "dirclientes").fields({
    total: Field.Int("total", "total"),
    codcliente: Field.Text("codcliente", "codcliente"),
    dirUnicaCanarias: Field.Bool("dir_unica_canarias", "dirección única de Canarias"),
    dirAuto: Field.Bool("dir_auto", "dirección automática por cliente"),
  }),
  nuevoPedidoTrato: Schema("ss_tratos", "idtrato").fields({
    idTrato: Field.Int("idtrato", "idtrato"),
    idCampania: Field.Int("idcampania", "idcampania"),
    codCliente: Field.Text("codcliente", "Cliente"),
    codAgente: Field.Text("codagente", "Agentes"),
    fechasalida: Field.Date("fechasalida", "Fecha"),
    codEvento: Field.Text("codevento", "Evento"),
    codDir: Field.Text("coddir", "Cod. Dirección"),
    sh_ctrlestadoborr: Field.Bool("sh_ctrlestadoborr", "Borrador").default(true),
    regimenIva: Field.Text("regimeniva", "Origen mercancia").default(null),
  }),
  nuevoPresupuestoTrato: Schema("ss_tratos", "idtrato").fields({
    idTrato: Field.Int("idtrato", "idtrato"),
    idCampania: Field.Int("idcampania", "idcampania"),
    codCliente: Field.Text("codcliente", "Cliente"),
    codAgente: Field.Text("codagente", "Agentes"),
    codEvento: Field.Text("sh_codevento", "Evento"),
    codDir: Field.Text("coddir", "Cod. Dirección"),
    regimenIva: Field.Text("regimeniva", "Origen mercancia").default(null),
  }),
  canalesCampaña: Schema("ss_canales", "codcanal").fields({
    codCanal: Field.Text("codcanal", "codcanal"),
    nombre: Field.Text("nombre", "nombre"),
    idCampania: Field.Int("idcampania", "idcampania"),
    idCanalCampania: Field.Text("idcanalcampania", "idcanalcampania"),
  }),
  borrarcanalcampania: Schema("ss_campanias", "idcanalcampania").fields({
    idCanalCampania: Field.Text("idcanalcampania", "idcanalcampania"),
  }),
  sincrocanalcampania: Schema("ss_campanias", "idcanalcampania").fields({
    idCanalCampania: Field.Text("idcanalcampania", "idcanalcampania"),
    idCampania: Field.Int("idcampania", "idcampania"),
  }),
  pedidosotrosagentes: Schema("ss_pedidoscliotrosagentes", "idpedido")
    .fields({
      idPedido: Field.Int("idpedido", "idPedido").auto(),
      codigo: Field.Text("codigo", "Código"),
      fecha: Field.Date("fecha", "Fecha"),
      nombreCliente: Field.Text("nombrecliente", "Nombre Cliente").required(),
      codCliente: Field.Text("codcliente", "Código de Cliente"),
      total: Field.Currency("total", "Total"),
      totalIva: Field.Currency("totaliva", "Total Iva"),
      neto: Field.Currency("neto", "Neto"),
      dirTipoVia: Field.Text("dirtipovia", "Tipo Vía"),
      direccion: Field.Text("direccion", "Direccion").required(),
      dirNum: Field.Text("dirnum", "Núm."),
      dirOtros: Field.Text("dirotros", "Otros"),
      codPostal: Field.Text("codpostal", "Cód. Postal"),
      ciudad: Field.Text("ciudad", "Ciudad"),
      provincia: Field.Text("provincia", "Provincia"),
      codDir: Field.Float("coddir", "Cód. Dir."),
      codAgente: Field.Text("codagente", "Agente"),
      nombreapAgente: Field.Text("nombreapagente", "Nombre y apellidos agente"),
      cifNif: Field.Text("cifnif", "CIF/NIF").required(),
      editable: Field.Bool("editable", "Editable").load(pedido => {
        return false;
      }),
      servido: Field.Text("servido", "Servido"),
      observaciones: Field.TextArea("observaciones", "Observaciones"),
    })
    .filter(() => ["1", "eq", "1"])
    .order(() => ({ field: "fecha", direction: "DESC" })),
  eventosCurso: Schema("eventos", "codevento")
    .fields({
      codCurso: Field.Text("codevento", "Cod. Evento").auto(),
      nombre: Field.Text("nombre", "Nombre").required(),
      tipoCurso: Field.Text("tipoevento", "Tipo").default("Curso"),
      fechaIni: Field.Date("fechaini", "Fecha inicio").required(),
      horaIni: Field.Time("horaini", "Hora inicio").required(),
      fechaFin: Field.Date("fechafin", "Fecha fin").required(),
      horaFin: Field.Time("horafin", "Hora fin").required(),
      codDir: Field.Text("coddir", "Cod. Dirección").required(),
      codCliente: Field.Text("codcliente", "codcliente").required(),
      nombreCliente: Field.Text("nombrecliente", "Nombre cliente"),
      codAlmacen: Field.Text("codalmacen", "codalmacen").default('ALM'),
      codAgente: Field.Text("codagente", "codagente").load(false).required(),
      nombreAlmacen: Field.Text("nombrealmacen", "Nombre almacen"),
      estado: Field.Text("estado", "estado").default("Planificado"),
      idCampania: Field.Int("idcampania", "Id campaña"),
      datosRevisados: Field.Bool("datosrevisados", "Datos de contactos revisados"),
      gastos: Field.Currency("sh_gastos", "Gastos"),
    })
    .filter(() => ["tipoevento", "eq", "Curso"])
    .order(() => ({ field: "fechaini", direction: "DESC" })),
  responsablesCurso: Schema("eventos", "id")
    .fields({
      idResponsableCurso: Field.Int("id", "Id responsable").auto(),
      codCurso: Field.Text("codevento", "Cod. Evento"),
      codAgente: Field.Text("codagente", "codagente").required(),
      nombreResponsable: Field.Text("nombreresponsable", "Nombre responsable"),
      emailResponsable: Field.Text("emailresponsable", "Email responsable"),
    }),
  contactosCurso: Schema("sh_timelinecontacto", "idtimelinecontacto").fields({
    idInteraccion: Field.Int("idtimelinecontacto", "ID"),
    tipo: Field.Text("tipo", "Tipo"),
    fecha: Field.Date("fecha", "Fecha"),
    codevento: Field.Text("codevento", "Evento"),
    codContacto: Field.Text("codcontacto", "Cod. Contacto"),
    nombreContacto: Field.Text("nombrecontacto", "Nombre Contacto"),
    emailContacto: Field.Text("emailcontacto", "Nombre Contacto"),
    telefonoContacto: Field.Text("telefonocontacto", "Nombre Contacto"),
    datosRevisados: Field.Bool("datosrevisados", "Datos contacto revisados"),
  }),
  clientes: Schema("clientes", "codcliente").fields({
    codCliente: Field.Text("codcliente", "Cliente"),
    codAgente: Field.Text("codagente", "Cod. Agente"),
    nombre: Field.Text("nombre", "Nombre"),
    cifNif: Field.Text("cifnif", "CIF/NIF"),
    nombreAgente: Field.Text("nombreagente", "Agente"),
    telefono: Field.Text("telefono", "Telefono"),
    formaPago: Field.Text("formapago", "Forma de pago"),
    dirCliente: Field.Text("dircliente", "Direccion").dump(false),
  }),
  contactosCliente: Schema("contactos", "codcontacto").fields({
    codContacto: Field.Text("codcontacto", "Cod. Contacto").auto(),
    nombre: Field.Text("nombre", "Nombre").required(),
    email: Field.Text("email", "E-mail").required(),
    telefono: Field.Text("telefono1", "Teléfono"),
    codCliente: Field.Text("codcliente", "cliente"),
  }),
  licencias: Schema("licenciascli", "idlicencia").fields({
    idLicencia: Field.Int("idlicencia", "Id licencia").auto(),
    tipo: Field.Text("tipo", "Tipo de licencia").required(),
    codCliente: Field.Text("codcliente", "Código cliente").required(),
    idTrato: Field.Int("idtrato", "Id trato"),
    fechaCaducidad: Field.Date("fechacaducidad", "Fecha de caducidad").required(),
    fechaInicioProceso: Field.Date("fechainicio", "Fecha de inicio de trámite"),
    fechaFinProceso: Field.Date("fechafin", "Fecha aprobación o rechazo").required(),
  }),
  googlecalendar: Schema("googlecalendar", "id").fields({
    authorization_response: Field.Text("authorization_response", "authorization_response"),
  }),
  notasTrato: Schema("ss_tratos", "idtrato").fields({
    idTrato: Field.Int("idtrato", "ID trato"),
    notas: Field.TextArea("notas", "Notas"),
    codContacto: Field.Text("codcontacto", "Contacto trato"),
  }),
  incidencias: Schema("incidencias", "codincidencia")
    .fields({
      codIncidencia: Field.Int("codincidencia", "Código de incidencia"),
      descripcion: Field.Text("descripcion", "Descripción"),
      descripcionLarga: Field.Text("descripcionlarga", "Descripción larga"),
      fecha: Field.Date("fecha", "Fecha"),
      codCliente: Field.Text("codcliente", "Cliente"),
      codAgente: Field.Text("codagente", "Agente"),
      idPresupuesto: Field.Int("idpresupuesto", "Id de presupuesto asociado"),
      codPresupuesto: Field.Text("codpresupuesto", "Código de presupuesto asociado"),
      nombreCliente: Field.Text("nomcliente", "Nombre Cliente"),
      codFamilia: Field.Text("codfamilia", "Familia"),
      referencia: Field.Text("referencia", "Referencia artículo"),
      descripcionReferencia: Field.Text("descripcionreferencia", "Descripción artículo").dump(
        false,
      ),
      prioridad: Field.Text("prioridad", "Prioridad"),
      estado: Field.Options("estado", "Estado incidencia")
        // .default("pendiente")
        .options([
          { key: "Nueva", value: "Nueva" },
          { key: "Pendiente de Datos", value: "Pendiente de Datos" },
          { key: "Pendiente", value: "Pendiente" },
          { key: "Asignada", value: "Asignada" },
          { key: "Rechazada", value: "Rechazada" },
          { key: "Cerrada", value: "Cerrada" },
        ]),
    })
    .order(() => ({ field: "fecha", direction: "DESC" })),
  nuevoPresupuestoIncidencia: Schema("incidencias", "codincidencia").fields({
    codIncidencia: Field.Int("codincidencia", "Código de incidencia"),
    codCliente: Field.Text("codcliente", "Cliente"),
    codAgente: Field.Text("codagente", "Agentes"),
    codDir: Field.Text("coddir", "Cod. Dirección"),
    regimenIva: Field.Text("regimeniva", "Origen mercancia").default(null),
  }),
});
