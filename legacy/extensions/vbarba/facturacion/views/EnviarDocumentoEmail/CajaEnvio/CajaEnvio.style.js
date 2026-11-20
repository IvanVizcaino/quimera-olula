export default parent => {
  return theme => {
    // const _p = parent(theme)
    return {
      tarjetaEmail: {
        "margin-bottom": 8,
        "display": "flex",
        "flexDirection": "row",
        "alignItems": "center",
        "justifyContent": "space-around",
        "border": "1px solid lightgrey",
        "borderRadius": 8,
        "padding": 5,
        "backgroundColor": "white",
        "&:hover": {
          border: "1px solid grey",
        },
      },
      chipTo: {
        color: "#000000",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      },
      iconoCerrar: {
        "margin-left": 8,
        "height": 8,
        "width": 8,
        // "cursor": "pointer",
        // "&:hover": {
        //   color: "red",
        // },
      },
    };
  };
};
