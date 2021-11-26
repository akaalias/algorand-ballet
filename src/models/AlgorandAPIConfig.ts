export class AlgorandAPIConfig {
  public static key = "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v";

  public static apiNetworks = [
    {
      name: "MainNet",
      domain: "mainnet-algorand.api.purestake.io",
      algoExplorerDomain: "algoexplorer.io",
    },
    {
      name: "TestNet",
      domain: "testnet-algorand.api.purestake.io",
      algoExplorerDomain: "testnet.algoexplorer.io",
    },
    {
      name: "BetaNet",
      domain: "betanet-algorand.api.purestake.io",
      algoExplorerDomain: "betanet.algoexplorer.io",
    },
  ];

  public static defaultNetwork = AlgorandAPIConfig.apiNetworks.find(x => x.name === "TestNet");
}