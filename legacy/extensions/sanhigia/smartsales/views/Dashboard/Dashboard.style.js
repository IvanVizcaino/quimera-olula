export default parent => {
  return theme => {
    const _p = parent(theme);

    return {
      ..._p,
      mainBoxSubtitle: {
        fontSize: "1.2rem",
        textDecoration: "underline",
      },
      tareasHeader: {
        margin: "5px 0",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        backgroundColor: "#fff",
        padding: "2px 10px",
        boxShadow: "0 0 5px 2px #c1c1c1",
      },
      botonAlertaHeader: {
        "margin": "15px 0",
        "display": "grid",
        "gridTemplateColumns": "3fr 1fr",
        "backgroundColor": "#fff",
        "padding": "2px 10px",
        "boxShadow": "0 0 5px 2px #c1c1c1",
        "&:hover": {
          cursor: "pointer",
        },
        // "justifyItems": "center",
        "alignItems": "center",
      },
      listItemTarea: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "flex-end",
      },
      listItemTareaAux: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.3rem",
        fontWeight: "700",
        color: "red",
        backgroundColor: "#e1e1e1",
        aspectRatio: "1",
        // width: "24px",
        borderRadius: "50%",
        textAlign: "center",
        padding: "3px",
      },
      agendaSwipeAction: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#505050",
        color: "white",
        margin: "5px 0",
        maxWidth: "25px",
        width: "25px",
        writingMode: "vertical-lr",
      },
      agendaBox: {
        margin: "5px 0 5px 5px",
      },
      container: {
        paddingBottom: "50px",
      },
    };
  };
};
