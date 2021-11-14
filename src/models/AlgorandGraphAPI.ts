  export class AlgorandGraphAPI {
    apiKey: string;
    networkDomain: string;

    constructor(networkDomain: string) {
      this.apiKey = "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v";
      this.networkDomain = networkDomain;
    }

    async accountIDGraphForRootAccountID(rootAccountID: string, depth: number) {
      let jsonData = "";
      const requestURL = `https://${this.networkDomain}/idx2/v2/accounts/${rootAccountID}/transactions`;

      const response = await fetch(requestURL, {
        method: "GET",
        headers: { accept: "application/json", "x-api-key": this.apiKey },
      });

      jsonData = await response.json()

      // Return
      return [
        { // node a
          data: { id: 'a' }
        }, { // node b
          data: { id: 'b' }
        }, { // edge ab
          data: { id: 'ab', source: 'a', target: 'b' }
        }
      ]
    }
  }
