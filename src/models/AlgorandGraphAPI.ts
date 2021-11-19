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
  static assetIDToInfoMap: Map<string, any>;

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
    if(AlgorandGraphAPI.assetIDToInfoMap == null) {
      AlgorandGraphAPI.assetIDToInfoMap = new Map();
    }
  }

  async assetInformationForAssetID(assetID: string) {
    console.log("In assetInformationForAssetID for " + assetID);
    if(AlgorandGraphAPI.assetIDToInfoMap.has(assetID)) {
      console.log("Already set. Returning");
      return AlgorandGraphAPI.assetIDToInfoMap.get(assetID);
    }

    console.log("Need to get info for this assetID");
    const requestURL = `https://${this.networkDomain}/idx2/v2/assets/${assetID}`;
    const response = await fetch(requestURL, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": this.apiKey },
    });
    const jsonData = await response.json();

    AlgorandGraphAPI.assetIDToInfoMap.set(assetID, jsonData);

    return AlgorandGraphAPI.assetIDToInfoMap.get(assetID);
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
        label: rootAccountID.substring(0, 7),
        distanceFromCenter: 300,
        type: "account-node"
      },
      classes: "root rootAccount",
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
    const txAmount = (txDetails.amount / 1000000) + "Ⱥ";

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
            distanceFromCenter: 100,
            type: "group-node",
          },
          classes: "group",
          type: "group",
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
          distanceFromCenter: 100,
          json: tx,
          type: "payment-transaction-node"
        },
        classes: txClass + " payment-transaction",
        type: "payment-transaction-node"
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
          label: tx.sender.substring(0,7),
          distanceFromCenter: 0,
          type: "account-node",
        },
        classes: "account",
        type: "account-node",
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
          label: txDetails.receiver.substring(0,7),
          distanceFromCenter: 0,
          type: "account-node",
        },
        classes: "account",
        type: "account-node",
      });
      this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
    }

    // Edges
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender, json: tx},
      classes: "outgoing-payment payment-transaction",
      type: "payment-transaction-edge",
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id + txDetails.receiver,
        source: tx.id,
        target: txDetails.receiver
      },
      classes: "incoming-payment payment-transaction",
      type: "payment-transaction-edge",
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

    // Asset Node
    this.elements.push({
      data: {
        id: txDetails["asset-id"],
        label: "ASA " + txDetails["asset-id"],
        distanceFromCenter: 100,
        type: "asset-node",
      },
      classes: "asset",
      type: "asset-node",
    });

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
            distanceFromCenter: 100,
            type: "group-node",
          },
          classes: "group",
          type: "group",
        });
      }
      this.capturedIDs.set(tx.group, tx.group)
    }

    // Asset TX Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if(!this.capturedIDs.has(tx.id)) {
      this.elements.push({
        data: {
          id: tx.id,
          label: txAmount,
          parent: groupID,
          distanceFromCenter: 100,
          json: tx,
          type: "asset-transfer-transaction-node",
        },
        classes: txClass + " asset-transfer-transaction",
        type: "asset-transfer-transaction-node"
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
          label: tx.sender.substring(0, 7),
          distanceFromCenter: 0,
          type: "account-node",
        },
        classes: "account",
        type: "account-node",
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
          label: txDetails.receiver.substring(0,7),
          distanceFromCenter: 0,
          type: "account-node",
        },
        classes: "account",
        type: "account-node"
      });
      this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
    }


    // Edges
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender, json: tx },
      classes: "outgoing-asset asset-transfer-transaction",
      type: "asset-transfer-transaction-edge",
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id + txDetails.receiver,
        source: tx.id,
        target: txDetails.receiver
      },
      classes: "incoming-asset asset-transfer-transaction",
      type: "asset-transfer-transaction-edge",
    });

    // ASA TX -> ASA Node
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.elements.push({
      data: {
        id: tx.id + txDetails['asset-id'],
        source: tx.id,
        target: txDetails['asset-id']
      },
      classes: "asset-call",
      type: "asset-call",
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
          label: tx.sender.substring(0,7),
          distanceFromCenter: 0,
          type: "account-node",
        },
        classes: "account",
        type: "account-node",
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
          label: "APP " + txDetails["application-id"],
          distanceFromCenter: 0,
          type: "application-node"
        },
        classes: "application",
        type: "application-node"
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
            distanceFromCenter: 100,
            type: "group-node",
          },
          classes: "group",
          type: "group-node"
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
          label: txDetails["application-id"] + "()",
          parent: groupID,
          distanceFromCenter: 100,
          json: tx,
          type: "application-transaction-node"
        },
        classes: txClass,
        type: "application-transaction-node"
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
            label: acID.substring(0,7),
            distanceFromCenter: 0,
            type: "account-node",
          },
          classes: "account",
          type: "account-node",
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
