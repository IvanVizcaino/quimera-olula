export default parent => {
  return theme => {
    // const _p = parent(theme)
    return {
      tarjetaEmail: {
        "display": "flex",
        "flexDirection": "row",
        "alignItems": "center",
        "justifyContent": "center",
        "border": "1px solid lightgrey",
        "borderRadius": 8,
        "padding": 5,
        "backgroundColor": "white",
        "&:hover": {
          border: "1px solid grey",
        },
      },
      chipDisponible: {
        // width: 100,
        // height: 32,
        // flexGrow: 0,
        color: "#000000",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      },
      icon: {
        "color": theme.custom.menu.alternative,
        "transition": "all .2s ease-in-out",
        "&:hover": {
          color: theme.custom.menu.accent,
          transform: "scale(1.2)",
        },
      },
    };
  };
};
