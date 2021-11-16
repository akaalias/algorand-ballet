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
  capturedIDs: Map<string, string>;

  customNamingConfig: Config = {
    dictionaries: [adjectives, colors, names, animals, starWars],
    separator: " ",
    length: 2,
    style: "capital",
  };

  applicationNamingConfig: Config = {
    dictionaries: [adjectives, colors, names, animals, starWars],
    separator: "",
    length: 2,
    style: "capital",
  };

  constructor(networkDomain: string) {
    this.apiKey = "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v";
    this.networkDomain = networkDomain;
    this.nameToAccountIDMap = new Map();
    this.elements = []
    this.capturedIDs = new Map()
  }

  async accountIDGraphForRootAccountID(rootAccountID: string, depth: number) {
    const requestURL = `https://${this.networkDomain}/idx2/v2/accounts/${rootAccountID}/transactions`;

    const response = await fetch(requestURL, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": this.apiKey },
    });

    const jsonData = await response.json();
    const transactions = jsonData.transactions;

    this.nameToAccountIDMap.set(
      rootAccountID,
      uniqueNamesGenerator(this.customNamingConfig)
    );

    // Root Node
    this.elements.push({
      data: {
        id: rootAccountID,
        label: this.nameToAccountIDMap.get(rootAccountID),
        distanceFromCenter: 0,
      },
      classes: "root",
    });
    this.capturedIDs.set(rootAccountID, rootAccountID)


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
      if(!this.capturedIDs.has(tx.group)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.elements.push({
          data: {
            id: tx.group,
            label: tx.group.substring(0, 8),
          },
          classes: "group",
        });
      }
      this.capturedIDs.set(tx.group, tx.group);
    }


    // TX Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(tx.id)) {
      this.elements.push({
        data: {
          id: tx.id,
          label: txAmount,
          parent: groupID,
          distanceFromCenter: 50,
          json: tx
        },
        classes: txClass + " payment-transaction",
      });
      this.capturedIDs.set(tx.id, tx.id);
    }


    // Sender Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(tx.sender)) {
      this.elements.push({
        data: {
          id: tx.sender,
          label: this.nameToAccountIDMap.get(tx.sender),
          distanceFromCenter: 100,
        },
        classes: "account",
      });
      this.capturedIDs.set(tx.sender, tx.sender);
    }

    // Receiver Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(txDetails.receiver)) {
      this.elements.push({
        data: {
          id: txDetails.receiver,
          label: this.nameToAccountIDMap.get(txDetails.receiver),
          distanceFromCenter: 100,
        },
        classes: "account",
      });
      this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
    }

    // Edges
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender, json: tx},
      classes: "outgoing payment-transaction",
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id + txDetails.receiver,
        source: tx.id,
        target: txDetails.receiver
      },
      classes: "incoming payment-transaction",
    });
  }
  private setElementsForAssetTransferTransaction(tx: any) {
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
      if(!this.capturedIDs.has(tx.group)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.elements.push({
          data: {
            id: tx.group,
            label: tx.group.substring(0, 8),
          },
          classes: "group",
        });
      }
      this.capturedIDs.set(tx.group, tx.group)
    }

    // TX Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(tx.id)) {
      this.elements.push({
        data: {
          id: tx.id,
          label: txAmount,
          parent: groupID,
          distanceFromCenter: 50,
          json: tx
        },
        classes: txClass + " asset-transfer-transaction",
      });
      this.capturedIDs.set(tx.id, tx.id);
    }


    // Sender Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(tx.sender)) {
      this.elements.push({
        data: {
          id: tx.sender,
          label: this.nameToAccountIDMap.get(tx.sender),
          distanceFromCenter: 100,
        },
        classes: "account",
      });

      this.capturedIDs.set(tx.sender, tx.sender);
    }

    // Receiver Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(txDetails.receiver)) {
      this.elements.push({
        data: {
          id: txDetails.receiver,
          label: this.nameToAccountIDMap.get(txDetails.receiver),
          distanceFromCenter: 100,
        },
        classes: "account",
      });
      this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
    }


    // Edges
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender, json: tx },
      classes: "outgoing asset-transfer-transaction",
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id + txDetails.receiver,
        source: tx.id,
        target: txDetails.receiver
      },
      classes: "incoming asset-transfer-transaction",
    });
  }
  private setElementsForApplicationTransaction(tx: any) {
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
        uniqueNamesGenerator(this.applicationNamingConfig)
      );
    }

    // Sender node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(tx.sender)) {
      this.elements.push({
        data: {
          id: tx.sender,
          label: this.nameToAccountIDMap.get(tx.sender),
          distanceFromCenter: 100,
        },
        classes: "account",
      });
      this.capturedIDs.set(tx.sender, tx.sender);
    }

    // Application Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(txDetails["application-id"])) {
      this.elements.push({
        data: {
          id: txDetails["application-id"],
          label: this.nameToAccountIDMap.get(txDetails["application-id"]),
        },
        classes: "application",
      });
      this.capturedIDs.set(txDetails["application-id"], txDetails["application-id"]);
    }

    // Group
    const groupID = tx.group;
    if (groupID != null) {
        if(!this.capturedIDs.has(tx.group)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.elements.push({
          data: {
            id: tx.group,
            label: tx.group.substring(0, 8),
          },
          classes: "group",
        });
      }
      this.capturedIDs.set(tx.group, tx.group)
    }


    // Transaction Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(tx.id)) {
      this.elements.push({
        data: {
          id: tx.id,
          label: this.nameToAccountIDMap.get(txDetails["application-id"]) + "()",
          parent: groupID,
          distanceFromCenter: 50,
          json: tx
        },
        classes: txClass,
      });
      this.capturedIDs.set(tx.id, tx.id);
    }


    // Edge sender -> Application TX
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender },
      classes: "application-call" + " " + txClass,
    });

    // Edge Application TX -> Application
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: txDetails["application-id"] + tx.id, target: tx.id, source: txDetails["application-id"] },
      classes: "application-call" + " " + txClass,
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
      if(!this.capturedIDs.has(acID)) {
        this.elements.push({
          data: {
            id: acID,
            label: this.nameToAccountIDMap.get(acID),
            distanceFromCenter: 100,
          },
          classes: "account",
        });

        this.capturedIDs.set(acID, acID);
      }


      // Edge acID -> AppTx
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.elements.push({
        data: {
          id: tx.id + acID,
          source: tx.id,
          target: acID,
        },
        classes: "application-call"  + " " + txClass,
      });
    }
  }
}
