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
        { data: {id: rootAccountID}, classes: 'account root' }
      ]

      if(transactions != null) {
        for(const tx of transactions) {
          console.log(tx)

          if(tx['payment-transaction'] != null) {
            const ptx = tx['payment-transaction']

            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            graph.push({ data: {id: tx.id}, classes: 'transaction'})
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            graph.push({ data: {id: tx.sender}, classes: 'account'})

              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              graph.push({ data: {id: tx.id + tx.sender, target: tx.id, source: tx.sender}})
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
              graph.push({ data: {id: tx.id + ptx.receiver, target: tx.id, source: ptx.receiver}})
          }
        }
      }

      return graph
    }
  }
