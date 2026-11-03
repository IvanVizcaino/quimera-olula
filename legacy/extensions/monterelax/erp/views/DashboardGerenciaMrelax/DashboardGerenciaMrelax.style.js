export default parent => {
  return theme => {
    const _p = parent(theme);

    return {
      ..._p,
      filterWrapper: {
        display: "flex",
        justifyContent: "flex-end",
      },
      report: {
        width: "100%",
        maxWidth: "1000px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        margin: "0 auto",
        padding: "25px",
        boxSizing: "border-box",
        color: theme.custom.menu.main,
      },
      reportHeader: {
        marginTop: "25px",
        display: "flex",
        justifyContent: "space-evenly",
        alignItems: "center",
      },
      mainMetric: {
        flexBasis: "375px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "0px 50px",
        boxSizing: "border-box",
      },
      mainMetricNums: {
        "marginTop": "5px",
        "& > *": {
          margin: "0px 12.5px",
        },
        "& > *:nth-child(2)": {
          color: "grey",
        },
      },
      meterFabricadas: {
        flexGrow: 1,
        height: "50px",
      },
      reportSection: {
        display: "flex",
        justifyContent: "space-between",
      },
      headerCharts: {
        flexBasis: "66%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "50px",
      },
      switchChart: {
        "alignSelf": "flex-end",
        "maxHeight": "25px",
        "& .MuiButton-containedPrimary": {
          color: theme.custom.menu.light,
          backgroundColor: theme.custom.menu.main,
        },
        "& .MuiButton-outlinedPrimary": {
          color: theme.custom.menu.main,
          border: `1px solid grey`,
        },
        "& .MuiButton-label": {
          fontSize: "12px",
        },
      },
      infoArticle: {
        "margin": "50px 2% 0%",
        "boxSizing": "border-box",
        "flexBasis": "50%",
        "& details summary": {
          pointerEvents: "none",
          listStyle: "none",
        },
        "& details summary strong": {
          fontWeight: 700,
        },
        "& details hr": {
          borderColor: theme.custom.menu.accent,
        },
        "& details section": {
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          minHeight: "90px",
        },
      },
      articleDetail: {
        "marginTop": "5px",
        "display": "flex",
        "justifyContent": "space-between",
        "fontWeight": "400",
        "&:first-child": {
          marginTop: "15px",
        },
        "& span": {
          display: "inline-block",
          textAlign: "right",
          width: "150px",
          minWidth: "150px",
          fontWeight: "initial",
          color: "grey",
        },
        "& span span": {
          display: "inline-block",
          width: "70px",
          minWidth: "70px",
          marginLeft: "12.5px",
        },
      },
      mobileResponsiveParent: {
        flexWrap: "wrap",
      },
      mobileResponsiveChild: {
        flexBasis: "100%",
      },
    };
  };
};
