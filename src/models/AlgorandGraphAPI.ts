import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
  names,
  starWars,
} from "unique-names-generator";

export class AlgorandGraphAPI {
  apiKey: string;
  networkDomain: string;
  nameToAccountIDMap: Map<any, any>;
  elements: Array<any>;

  customNamingConfig: Config = {
    dictionaries: [adjectives, colors, names, animals, starWars],
    separator: " ",
    length: 2,
    style: "capital",
  };

  constructor(networkDomain: string) {
    this.apiKey = "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v";
    this.networkDomain = networkDomain;
    this.nameToAccountIDMap = new Map();
    this.elements = []
  }

  async accountIDGraphForRootAccountID(rootAccountID: string, depth: number) {
    const requestURL = `https://${this.networkDomain}/idx2/v2/accounts/${rootAccountID}/transactions`;

    const response = await fetch(requestURL, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": this.apiKey },
    });

    const jsonData = await response.json();
    console.log(jsonData);
    const transactions = jsonData.transactions;

    this.nameToAccountIDMap.set(
      rootAccountID,
      uniqueNamesGenerator(this.customNamingConfig)
    );

    this.elements.push({
      data: {
        id: rootAccountID,
        label: this.nameToAccountIDMap.get(rootAccountID),
        distanceFromCenter: 100,
      },
      classes: "root account",
    });

    if (transactions != null) {
      for (const tx of transactions) {
        if (tx["payment-transaction"] != null) {
          this.setElementsForPaymentTransaction(tx);
        } else if (tx["asset-transfer-transaction"] != null) {
          this.setElementsForAssetTransferTransaction(tx);
        } else if (tx["tx-type"] == "appl") {
          this.setElementsForApplicationTransaction(tx);
        } else {
          continue;
        }
      }
      return this.elements;
    }
  }
  private setElementsForPaymentTransaction(tx: any) {
    console.log("Processing Payment Transaction")
    const txDetails = tx["payment-transaction"];
    const txClass = "payment-transaction";
    const txAmount = txDetails.amount / 1000.0 + "Ⱥ";

    if (!this.nameToAccountIDMap.has(tx.sender)) {
      this.nameToAccountIDMap.set(
        tx.sender,
        uniqueNamesGenerator(this.customNamingConfig)
      );
    }

    if (!this.nameToAccountIDMap.has(txDetails.receiver)) {
      this.nameToAccountIDMap.set(
        txDetails.receiver,
        uniqueNamesGenerator(this.customNamingConfig)
      );
    }

    // Group
    const groupID = tx.group;
    if (groupID != null) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.elements.push({
        data: {
          id: tx.group,
          label: tx.group.substring(0, 8),
          distanceFromCenter: 50,
        },
        classes: "group",
      });
    }

    // Nodes
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id,
        label: txAmount,
        parent: groupID,
        distanceFromCenter: 50,
      },
      classes: txClass,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.sender,
        label: this.nameToAccountIDMap.get(tx.sender),
        distanceFromCenter: 0,
      },
      classes: "account",
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: txDetails.receiver,
        label: this.nameToAccountIDMap.get(txDetails.receiver),
        distanceFromCenter: 0,
      },
      classes: "account",
    });

    // Edges
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender },
      classes: "outgoing",
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id + txDetails.receiver,
        source: tx.id,
        target: txDetails.receiver,
      },
      classes: "incoming",
    });
  }

  private setElementsForAssetTransferTransaction(tx: any) {
    console.log("Processing Asset Transfer Transaction")

    const txDetails = tx["asset-transfer-transaction"];
    const txClass = "asset-transfer-transaction";
    const txAmount = txDetails.amount;

    if (!this.nameToAccountIDMap.has(tx.sender)) {
      this.nameToAccountIDMap.set(
        tx.sender,
        uniqueNamesGenerator(this.customNamingConfig)
      );
    }

    if (!this.nameToAccountIDMap.has(txDetails.receiver)) {
      this.nameToAccountIDMap.set(
        txDetails.receiver,
        uniqueNamesGenerator(this.customNamingConfig)
      );
    }

    // Group
    const groupID = tx.group;
    if (groupID != null) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.elements.push({
        data: {
          id: tx.group,
          label: tx.group.substring(0, 8),
          distanceFromCenter: 50,
        },
        classes: "group",
      });
    }

    // Nodes
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id,
        label: txAmount,
        parent: groupID,
        distanceFromCenter: 50,
      },
      classes: txClass,
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.sender,
        label: this.nameToAccountIDMap.get(tx.sender),
        distanceFromCenter: 0,
      },
      classes: "account",
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: txDetails.receiver,
        label: this.nameToAccountIDMap.get(txDetails.receiver),
        distanceFromCenter: 0,
      },
      classes: "account",
    });

    // Edges
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender },
      classes: "outgoing",
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id + txDetails.receiver,
        source: tx.id,
        target: txDetails.receiver,
      },
      classes: "incoming",
    });
  }

  private setElementsForApplicationTransaction(tx: any) {
    console.log("Processing Application Transaction")

    const txDetails = tx["application-transaction"];
    const txClass = "application-transaction";

    if (!this.nameToAccountIDMap.has(tx.sender)) {
      this.nameToAccountIDMap.set(
        tx.sender,
        uniqueNamesGenerator(this.customNamingConfig)
      );
    }

    if (!this.nameToAccountIDMap.has(txDetails["application-id"])) {
      this.nameToAccountIDMap.set(
        txDetails["application-id"],
        uniqueNamesGenerator(this.customNamingConfig)
      );
    }

    // Sender node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.sender,
        label: this.nameToAccountIDMap.get(tx.sender),
        distanceFromCenter: 0,
      },
      classes: "account",
    });

    // Group
    const groupID = tx.group;
    if (groupID != null) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.elements.push({
        data: {
          id: tx.group,
          label: tx.group.substring(0, 8),
          distanceFromCenter: 50,
        },
        classes: "group",
      });
    }

    // App Transaction Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id,
        label: this.nameToAccountIDMap.get(txDetails["application-id"]),
        parent: groupID,
        distanceFromCenter: 50,
      },
      classes: txClass,
    });

    // Edge sender -> Application TX
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender },
      classes: "application-call",
    });

    // there may be more than one related account
    for(const acID of txDetails.accounts) {
      if (!this.nameToAccountIDMap.has(acID)) {
        this.nameToAccountIDMap.set(
          acID,
          uniqueNamesGenerator(this.customNamingConfig)
        );
      }

      // Node account
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.elements.push({
        data: {
          id: acID,
          label: this.nameToAccountIDMap.get(acID),
          distanceFromCenter: 0,
        },
        classes: "account",
      });

      // Edge acID -> AppTx
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.elements.push({
        data: {
          id: tx.id + acID,
          source: tx.id,
          target: acID,
        },
        classes: "application-call",
      });
    }
  }
}
