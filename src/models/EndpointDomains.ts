export class EndpointDomains {
  public static apiNetworks = [
    {
      name: "MainNet",
      domain: "mainnet-algorand.api.purestake.io",
      algoExplorerDomain: "algoexplorer.io",
      key: "main"
    },
    {
      name: "TestNet",
      domain: "testnet-algorand.api.purestake.io",
      algoExplorerDomain: "testnet.algoexplorer.io",
      key: "test"
    },
    {
      name: "BetaNet",
      domain: "betanet-algorand.api.purestake.io",
      algoExplorerDomain: "betanet.algoexplorer.io",
      key: "beta"
    },
  ];

  public static defaultNetwork = EndpointDomains.apiNetworks.find(x => x.key === "main");
}