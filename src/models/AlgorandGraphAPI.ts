import { uniqueNamesGenerator, Config, adjectives, colors, animals, names, starWars } from "unique-names-generator";

export class AlgorandGraphAPI {
  apiKey: string;
  networkDomain: string;

  constructor(networkDomain: string) {
    this.apiKey = "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v";
    this.networkDomain = networkDomain;
  }

  async accountIDGraphForRootAccountID(rootAccountID: string, depth: number) {
    const requestURL = `https://${this.networkDomain}/idx2/v2/accounts/${rootAccountID}/transactions`;

    const response = await fetch(requestURL, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": this.apiKey }
    });

    const jsonData = await response.json();
    const transactions = jsonData.transactions;
    const customConfig: Config = {
      dictionaries: [adjectives, colors, names, animals, starWars],
      separator: ' ',
      length: 2,
      style: 'capital'
    }

    const nameToAccountIDMap = new Map()
    nameToAccountIDMap.set(rootAccountID, uniqueNamesGenerator(customConfig))

    const graph = [
      { data: { id: rootAccountID, label: nameToAccountIDMap.get(rootAccountID) }, classes: "root account" }
    ];

    if (transactions != null) {
      for (const tx of transactions) {

        if (tx["payment-transaction"] != null) {
          const ptx = tx["payment-transaction"]

          if(!nameToAccountIDMap.has(tx.sender)) {
            nameToAccountIDMap.set(tx.sender, uniqueNamesGenerator(customConfig))
          }

          if(!nameToAccountIDMap.has(ptx.receiver)) {
            nameToAccountIDMap.set(ptx.receiver, uniqueNamesGenerator(customConfig))
          }

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          graph.push({ data: { id: tx.id, label: ptx.amount }, classes: "transaction" });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          graph.push({ data: { id: tx.sender, label: nameToAccountIDMap.get(tx.sender) }, classes: "account" });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          graph.push({ data: { id: ptx.receiver, label: nameToAccountIDMap.get(ptx.receiver) }, classes: "account" });

          // Edges
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          graph.push({ data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender }, classes: "outgoing" });
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          graph.push({ data: { id: tx.id + ptx.receiver, source: tx.id, target: ptx.receiver }, classes: "incoming" });
        }
      }
    }

    return graph;
  }
}
