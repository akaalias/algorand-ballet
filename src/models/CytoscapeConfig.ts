export class CytoscapeConfig {
  public static cyConfig = {
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "text-valign": "center",
          "text-halign": "center",
          "text-outline-color": "#555",
          "text-outline-width": "3px",
          color: "#fff",
        },
      },
      {
        selector: "edge",
        style: {
          width: 3,
          "line-color": "#ccc",
          "font-size": 14,
        },
      },
      {
        selector: "node.root",
        style: {
          width: "100",
          height: "100",
          "background-color": "#ffa600",
          label: "data(label)",
          "font-size": 20,
        },
      },
      {
        selector: "node.account",
        style: {
          width: "100",
          height: "100",
          shape: "ellipse",
          label: "data(label)",
          "background-color": "#ff7c43",
          "font-size": 20,
        },
      },
      {
        selector: "node.application",
        style: {
          width: "120",
          height: "120",
          shape: "diamond",
          "background-color": "#003f5c",
          label: "data(label)",
        },
      },
      {
        selector: "node.asset",
        style: {
          width: "120",
          height: "120",
          shape: "triangle",
          "background-color": "#6e3866",
          label: "data(label)",
        },
      },
      {
        selector: "node.payment-transaction",
        style: {
          shape: "rectangle",
          "background-color": "#f95d6a",
          width: "50",
          height: "50",
        },
      },
      {
        selector: "node.asset-transfer-transaction",
        style: {
          shape: "triangle",
          "background-color": "#a05195",
          width: "50",
          height: "50",
        },
      },
      {
        selector: "node.application-transaction",
        style: {
          shape: "diamond",
          "background-color": "#2f4b7c",
          width: "50",
          height: "50",
        },
      },
      {
        selector: "edge.outgoing-payment",
        style: {
          "line-color": "#f95d6a",
          "mid-target-arrow-shape": "triangle",
          "mid-target-arrow-color": "#f95d6a",
          "arrow-scale": 1.5,
        },
      },
      {
        selector: "edge.incoming-payment",
        style: {
          "line-color": "#008a0b",
          "mid-target-arrow-shape": "triangle",
          "mid-target-arrow-color": "#008a0b",
          "arrow-scale": 1.5,
        },
      },
      {
        selector: "edge.outgoing-asset",
        style: {
          "line-color": "#800000",
          "mid-target-arrow-shape": "triangle",
          "mid-target-arrow-color": "#800000",
          "arrow-scale": 1.5,
        },
      },
      {
        selector: "edge.incoming-asset",
        style: {
          "line-color": "#008a0b",
          "mid-target-arrow-shape": "triangle",
          "mid-target-arrow-color": "#008a0b",
          "arrow-scale": 1.5,
        },
      },
      {
        selector: "edge.application-call",
        style: {
          "line-color": "#565589",
        },
      },
      {
        selector: "edge.asset-call",
        style: {
          "line-color": "#40203b",
        },
      },
      {
        selector: ":parent",
        style: {
          "border-width": 2,
          "border-color": "#333",
          shape: "roundrectangle",
          label: "",
          "background-opacity": 0,
        },
      },
      {
        selector: "edge.payment-relationship",
        style: {
          width: "mapData(weight, 0, 100, 0, 100)",
          "line-color": "rgba(151,53,0,0.69)",
          "curve-style": "unbundled-bezier",
          "control-point-distances": [50],
          "source-endpoint": "inside-to-node",
          "target-endpoint": "inside-to-node",
          "text-outline-color": "#555",
          "text-outline-width": "3px",
          color: "#fff",
          label: "data(weight)"
        },
      },
      {
        selector: "edge.asset-relationship",
        style: {
          width: "mapData(weight, 0, 100, 0, 100)",
          "line-color": "#a05195",
          "curve-style": "unbundled-bezier",
          "control-point-distances": [-40],
          "source-endpoint": "inside-to-node",
          "target-endpoint": "inside-to-node",
          "text-outline-color": "#555",
          "text-outline-width": "3px",
          color: "#fff",
          label: "data(weight)"
        },
      },
      {
        selector: "edge.asset-relationship-loop",
        style: {
          width: "mapData(weight, 0, 100, 0, 100)",
          "line-color": "#a05195",
          "source-endpoint": "outside-to-node",
          "target-endpoint": "outside-to-node",
          "curve-style": "bezier",
          "loop-direction": "-45deg",
          "loop-sweep": "90deg",
          "control-point-step-size": 80,
          "text-outline-color": "#555",
          "text-outline-width": "3px",
          color: "#fff",
          "label": "data(weight)",
        },
      },
      {
        selector: "edge.application-relationship",
        style: {
          width: "mapData(weight, 0, 100, 0, 100)",
          "line-color": "#2f4b7c",
          "curve-style": "unbundled-bezier",
          "control-point-distances": [0],
          "source-endpoint": "inside-to-node",
          "target-endpoint": "inside-to-node",
          "text-outline-color": "#555",
          "text-outline-width": "3px",
          color: "#fff",
          label: "data(weight)"
        },
      },
    ],
  };
  public static layoutConfigurations = {
    "grid": {name: "grid", animate: true},
    "circle": {name: "circle", animate: true},
    "concentric": {name: "concentric", animate: true},
    "breadthfirst": {name: "breadthfirst", animate: true},
    "random": {name: "random", animate: true, fit: true},
  };
  public static defaultLayoutName = "circle";
}