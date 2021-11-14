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
        headers: { accept: "application/json", "x-api-key": this.apiKey },
      });

      const jsonData = await response.json()
      const transactions = jsonData.transactions

      const graph = [
        { data: {id: rootAccountID, label: "Target Account"}, classes: 'root' }
      ]

      if(transactions != null) {
        for(const tx of transactions) {
          console.log(tx)

          if(tx['payment-transaction'] != null) {
            const ptx = tx['payment-transaction']

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            graph.push({ data: {id: tx.id, label: ptx.amount}, classes: 'transaction'})
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            graph.push({ data: {id: tx.sender, label: tx.sender}, classes: 'account'})
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            graph.push({ data: {id: ptx.receiver, label: ptx.receiver}, classes: 'account'})

            // Edges
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            graph.push({ data: {id: tx.id + tx.sender, target: tx.id, source: tx.sender}, classes: "outgoing"})
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            graph.push({ data: {id: tx.id + ptx.receiver, source: tx.id, target: ptx.receiver}, classes: "incoming"})
          }
        }
      }

      return graph
    }
  }
