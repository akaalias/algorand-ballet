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

    console.log(jsonData);

    const customConfig: Config = {
      dictionaries: [adjectives, colors, names, animals, starWars],
      separator: " ",
      length: 2,
      style: "capital"
    };

    const nameToAccountIDMap = new Map();
    nameToAccountIDMap.set(rootAccountID, uniqueNamesGenerator(customConfig));

    const graph = [
      { data: { id: rootAccountID, label: nameToAccountIDMap.get(rootAccountID) }, classes: "root account" }
    ];

    if (transactions != null) {
      for (const tx of transactions) {
        let txDetails: any;
        let txClass: string;

        if (tx["payment-transaction"] != null) {
          txDetails = tx["payment-transaction"]
          txClass = "payment-transaction"
        } else if (tx["asset-transfer-transaction"] != null) {
          txDetails = tx["asset-transfer-transaction"]
          txClass = "asset-transfer-transaction"
        } else {
          continue
        }

        if (!nameToAccountIDMap.has(tx.sender)) {
          nameToAccountIDMap.set(tx.sender, uniqueNamesGenerator(customConfig));
        }

        if (!nameToAccountIDMap.has(txDetails.receiver)) {
          nameToAccountIDMap.set(txDetails.receiver, uniqueNamesGenerator(customConfig));
        }

        const groupID = tx.group
        if(groupID != null) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          graph.push({data: {id: tx.group, label: tx.group.substring(0, 8)}, classes: "group"})
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        graph.push({ data: { id: tx.id, label: txDetails.amount, parent: groupID}, classes: txClass });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        graph.push({ data: { id: tx.sender, label: nameToAccountIDMap.get(tx.sender)}, classes: "account" });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        graph.push({ data: { id: txDetails.receiver, label: nameToAccountIDMap.get(txDetails.receiver) }, classes: "account" });

        // Edges
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        graph.push({ data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender }, classes: "outgoing" });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        graph.push({ data: { id: tx.id + txDetails.receiver, source: tx.id, target: txDetails.receiver }, classes: "incoming" });
      }
    }

    return graph;
  }
}
