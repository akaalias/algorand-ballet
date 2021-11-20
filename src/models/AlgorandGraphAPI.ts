export class AlgorandGraphAPI {
  apiKey: string;
  networkDomain: string;
  nameToAccountIDMap: Map<unknown, any>;
  elements: Array<any>;
  capturedIDs: Map<string, string>;
  capturedEdges: Map<string, string>;
  static assetIDToInfoMap: Map<string, any>;

  constructor(networkDomain: string) {
    this.apiKey = "pksIgccdqX9ADKvMLfVhf3hZqClM949951K9966v";
    this.networkDomain = networkDomain;
    this.nameToAccountIDMap = new Map();
    this.elements = [];
    this.capturedIDs = new Map();
    this.capturedEdges = new Map();
    if (AlgorandGraphAPI.assetIDToInfoMap == null) {
      AlgorandGraphAPI.assetIDToInfoMap = new Map();
    }
  }
  async graphForRootAccountID(rootAccountID: string) {
    const transactions = await this.getTransactions(rootAccountID);

    this.setRootNodeInElements(rootAccountID);

    if (transactions != null) {
      for (const tx of transactions) {
        // Add Sender Node regardless of what kind of TX it is
        this.addSenderNode(tx);

        // Handle payment TXs
        if (tx["tx-type"] === "pay") {
          this.handlePaymentTransaction(tx);
        } else if (tx["tx-type"] === "axfer") {
          this.handleAssetTransferTransaction(tx);
        } else if (tx["tx-type"] === "appl") {
          this.handleApplicationTransaction(tx);
        }
      }
    }

    return this.elements;
  }

  private addSenderNode(tx: any) {
    if (!this.capturedIDs.has(tx.sender)) {
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
    } else {
      console.log();
    }
  }

  private handleApplicationTransaction(tx: any) {
    const txDetails = tx["application-transaction"];
    const applicationID = txDetails["application-id"];

    // Add Application Node
    if (!this.capturedIDs.has(applicationID)) {
      this.elements.push({
        data: {
          id: applicationID,
          label: "APP " + applicationID,
        },
        classes: "application",
      });
      this.capturedIDs.set(applicationID, applicationID);
    }

    // Add relationship sender -> application
    const senderID = tx.sender;
    const compoundAccountApplicationEdgeID = senderID + "-" + applicationID;

    if (!this.capturedEdges.has(compoundAccountApplicationEdgeID)) {
      this.elements.push({
        data: {
          id: compoundAccountApplicationEdgeID,
          target: applicationID,
          source: senderID,
          weight: 1,
        },
        classes: "application-relationship",
      });

      this.capturedEdges.set(
        compoundAccountApplicationEdgeID,
        compoundAccountApplicationEdgeID
      );
    } else {
      const objIndex = this.elements.findIndex(
        (obj) => obj.data.id === compoundAccountApplicationEdgeID
      );
      this.elements[objIndex].data.weight += 1;
    }

    // Iterate over accounts in TX details
    for (const involvedAccountID of txDetails["accounts"]) {
      // Add involved accounts
      if (!this.capturedIDs.has(involvedAccountID)) {
        this.elements.push({
          data: {
            id: involvedAccountID,
            label: involvedAccountID.substring(0, 7),
            type: "account-node",
          },
          classes: "account",
        });
        this.capturedIDs.set(involvedAccountID, involvedAccountID);
      } else {
        console.log();
      }

      // Add edge between involved account and application
      const connectionBetweenInvolvedAccountAndApplication =
        involvedAccountID + "-" + applicationID;

      if (
        !this.capturedEdges.has(connectionBetweenInvolvedAccountAndApplication)
      ) {
        this.elements.push({
          data: {
            id: connectionBetweenInvolvedAccountAndApplication,
            target: applicationID,
            source: involvedAccountID,
            weight: 1,
          },
          classes: "application-relationship",
        });

        this.capturedEdges.set(
          connectionBetweenInvolvedAccountAndApplication,
          connectionBetweenInvolvedAccountAndApplication
        );
      } else {
        const objIndex = this.elements.findIndex(
          (obj) =>
            obj.data.id === connectionBetweenInvolvedAccountAndApplication
        );
        this.elements[objIndex].data.weight += 1;
      }

      // Add edge between sender account and involved account
      const compoundEdgeID =
        involvedAccountID + "-" + senderID + "-" + applicationID;
      if (!this.capturedEdges.has(compoundEdgeID)) {
        this.elements.push({
          data: {
            id: compoundEdgeID,
            target: tx.sender,
            source: involvedAccountID,
            weight: 1,
          },
          classes: "application-relationship",
        });

        this.capturedEdges.set(compoundEdgeID, compoundEdgeID);
      } else {
        const objIndex = this.elements.findIndex(
          (obj) => obj.data.id === compoundEdgeID
        );
        this.elements[objIndex].data.weight += 1;
      }
    }
  }

  private handleAssetTransferTransaction(tx: any) {
    const txDetails = tx["asset-transfer-transaction"];
    const assetID = txDetails["asset-id"];
    const senderID = tx.sender;
    const receiverID = txDetails.receiver;

    // Add Asset Node
    if (!this.capturedIDs.has(assetID)) {
      this.elements.push({
        data: {
          id: assetID,
          label: "ASA " + assetID,
        },
        classes: "asset",
      });
      this.capturedIDs.set(assetID, assetID);
    }

    // Add relationship sender -> asset
    const compoundAccountAssetEdgeID = senderID + "-" + assetID;

    if (!this.capturedEdges.has(compoundAccountAssetEdgeID)) {
      this.elements.push({
        data: {
          id: compoundAccountAssetEdgeID,
          target: assetID,
          source: senderID,
          weight: 1,
        },
        classes: "asset-relationship",
      });

      this.capturedEdges.set(
        compoundAccountAssetEdgeID,
        compoundAccountAssetEdgeID
      );
    } else {
      const objIndex = this.elements.findIndex(
        (obj) => obj.data.id === compoundAccountAssetEdgeID
      );
      this.elements[objIndex].data.weight += 1;
    }


    // Create Receiver
    if (!this.capturedIDs.has(receiverID)) {
      this.elements.push({
        data: {
          id: receiverID,
          label: receiverID.substring(0, 7),
          type: "account-node",
        },
        classes: "account",
      });
      this.capturedIDs.set(receiverID, receiverID);
    }

    // Add relationship receiver -> asset
    const inverseReceiverEdgeID = assetID + "-" + receiverID;
    let receiverEdgeID = receiverID + "-" + assetID;

    if (this.capturedIDs.has(inverseReceiverEdgeID)) {
      receiverEdgeID = assetID + "-" + receiverID;
    }

    if (!this.capturedEdges.has(receiverEdgeID)) {
      this.elements.push({
        data: {
          id: receiverEdgeID,
          target: assetID,
          source: receiverID,
          weight: 1,
        },
        classes: "asset-relationship",
      });

      this.capturedEdges.set(receiverEdgeID, receiverEdgeID);
    } else {
      const objIndex = this.elements.findIndex(
        (obj) => obj.data.id === receiverEdgeID
      );
      this.elements[objIndex].data.weight += 1;
    }

    // Add Sender -> Receiver Edge
    const compoundIDSenderReceiver = senderID + "-" + receiverID

    if(!this.capturedEdges.has(compoundIDSenderReceiver)) {
      console.log("Let's add edge between " + senderID.substring(0,7) + " and " + receiverID.substring(0,7))
      this.elements.push({
        data: {
          id: compoundIDSenderReceiver,
          target: txDetails.receiver,
          source: senderID,
          weight: 1,
        },
        classes: "asset-relationship",
      });

      this.capturedEdges.set(compoundIDSenderReceiver, compoundIDSenderReceiver);
    } else {
      const objIndex = this.elements.findIndex(
        (obj) => obj.data.id === compoundIDSenderReceiver
      );
      this.elements[objIndex].data.weight += 1;
    }
  }

  private handlePaymentTransaction(tx: any) {
    const txDetails = tx["payment-transaction"];

    // Receiver Node
    if (!this.capturedIDs.has(txDetails.receiver)) {
      this.elements.push({
        data: {
          id: txDetails.receiver,
          label: txDetails.receiver.substring(0, 7),
          type: "account-node",
        },
        classes: "account",
        type: "account-node",
      });
      this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
    } else {
      console.log();
    }

    let senderID = tx.sender;
    let receiverID = txDetails.receiver;
    let compoundEdgeID = senderID + "-" + receiverID;

    // Avoid adding an extra edge
    if (!this.capturedEdges.has(compoundEdgeID)) {
      senderID = txDetails.receiver;
      receiverID = tx.sender;
      compoundEdgeID = senderID + "-" + receiverID;
    }

    if (!this.capturedEdges.has(compoundEdgeID)) {
      // Looping Edges
      if (senderID === receiverID) {
        this.elements.push({
          data: {
            id: compoundEdgeID,
            target: senderID,
            source: receiverID,
            weight: 1,
          },
          classes: "loop",
        });
      } else {
        this.elements.push({
          data: {
            id: compoundEdgeID,
            target: senderID,
            source: receiverID,
            weight: 1,
          },
          classes: "payment-relationship",
        });
      }

      this.capturedEdges.set(compoundEdgeID, compoundEdgeID);
    } else {
      const objIndex = this.elements.findIndex(
        (obj) => obj.data.id === compoundEdgeID
      );
      this.elements[objIndex].data.weight += 1;
    }
  }

  async networkForRootAccountID(rootAccountID: string) {
    this.setRootNodeInElements(rootAccountID);

    const transactions = await this.getTransactions(rootAccountID);

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

  private async getTransactions(rootAccountID: string) {
    const requestURL = `https://${this.networkDomain}/idx2/v2/accounts/${rootAccountID}/transactions`;

    const response = await fetch(requestURL, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": this.apiKey },
    });

    const jsonData = await response.json();
    const transactions = jsonData.transactions;
    return transactions;
  }

  private setRootNodeInElements(rootAccountID: string) {
    // Root Node
    this.elements.push({
      data: {
        id: rootAccountID,
        label: rootAccountID.substring(0, 7),
        distanceFromCenter: 300,
        type: "account-node",
      },
      classes: "root",
    });
    this.capturedIDs.set(rootAccountID, rootAccountID);
  }

  private setElementsForPaymentTransaction(tx: any) {
    const txDetails = tx["payment-transaction"];
    const txClass = "payment-transaction";
    const txAmount = txDetails.amount / 1000000 + "Ⱥ";

    // Group
    const groupID = tx.group;
    if (groupID != null) {
      if (!this.capturedIDs.has(tx.group)) {
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
    if (!this.capturedIDs.has(tx.id)) {
      this.elements.push({
        data: {
          id: tx.id,
          label: txAmount,
          parent: groupID,
          distanceFromCenter: 100,
          json: tx,
          type: "payment-transaction-node",
        },
        classes: txClass + " payment-transaction",
        type: "payment-transaction-node",
      });
      this.capturedIDs.set(tx.id, tx.id);
    }

    // Sender Node
    if (!this.capturedIDs.has(tx.sender)) {
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
    if (!this.capturedIDs.has(txDetails.receiver)) {
      this.elements.push({
        data: {
          id: txDetails.receiver,
          label: txDetails.receiver.substring(0, 7),
          distanceFromCenter: 0,
          type: "account-node",
        },
        classes: "account",
        type: "account-node",
      });
      this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
    }

    // Edges
    this.elements.push({
      data: {
        id: tx.id + tx.sender,
        target: tx.id,
        source: tx.sender,
        json: tx,
      },
      classes: "outgoing-payment payment-transaction",
      type: "payment-transaction-edge",
    });

    this.elements.push({
      data: {
        id: tx.id + txDetails.receiver,
        source: tx.id,
        target: txDetails.receiver,
      },
      classes: "incoming-payment payment-transaction",
      type: "payment-transaction-edge",
    });
  }
  private setElementsForAssetTransferTransaction(tx: any) {
    const txDetails = tx["asset-transfer-transaction"];
    const txClass = "asset-transfer-transaction";
    const txAmount = txDetails.amount;

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
      if (!this.capturedIDs.has(tx.group)) {
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

    // Asset TX Node
    if (!this.capturedIDs.has(tx.id)) {
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
        type: "asset-transfer-transaction-node",
      });
      this.capturedIDs.set(tx.id, tx.id);
    }

    // Sender Node
    if (!this.capturedIDs.has(tx.sender)) {
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
    if (!this.capturedIDs.has(txDetails.receiver)) {
      this.elements.push({
        data: {
          id: txDetails.receiver,
          label: txDetails.receiver.substring(0, 7),
          distanceFromCenter: 0,
          type: "account-node",
        },
        classes: "account",
        type: "account-node",
      });
      this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
    }

    // Edges
    this.elements.push({
      data: {
        id: tx.id + tx.sender,
        target: tx.id,
        source: tx.sender,
        json: tx,
      },
      classes: "outgoing-asset asset-transfer-transaction",
      type: "asset-transfer-transaction-edge",
    });

    this.elements.push({
      data: {
        id: tx.id + txDetails.receiver,
        source: tx.id,
        target: txDetails.receiver,
      },
      classes: "incoming-asset asset-transfer-transaction",
      type: "asset-transfer-transaction-edge",
    });

    // ASA TX -> ASA Node
    this.elements.push({
      data: {
        id: tx.id + txDetails["asset-id"],
        source: tx.id,
        target: txDetails["asset-id"],
      },
      classes: "asset-call",
      type: "asset-call",
    });
  }

  private setElementsForApplicationTransaction(tx: any) {
    const txDetails = tx["application-transaction"];
    const txClass = "application-transaction";

    // Sender node
    if (!this.capturedIDs.has(tx.sender)) {
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

    // Application Node
    if (!this.capturedIDs.has(txDetails["application-id"])) {
      this.elements.push({
        data: {
          id: txDetails["application-id"],
          label: "APP " + txDetails["application-id"],
          distanceFromCenter: 0,
          type: "application-node",
        },
        classes: "application",
        type: "application-node",
      });
      this.capturedIDs.set(
        txDetails["application-id"],
        txDetails["application-id"]
      );
    }

    // Group
    const groupID = tx.group;
    if (groupID != null) {
      if (!this.capturedIDs.has(tx.group)) {
        this.elements.push({
          data: {
            id: tx.group,
            label: tx.group.substring(0, 8),
            distanceFromCenter: 100,
            type: "group-node",
          },
          classes: "group",
          type: "group-node",
        });
      }
      this.capturedIDs.set(tx.group, tx.group);
    }

    // Transaction Node
    if (!this.capturedIDs.has(tx.id)) {
      this.elements.push({
        data: {
          id: tx.id,
          label: txDetails["application-id"] + "()",
          parent: groupID,
          distanceFromCenter: 100,
          json: tx,
          type: "application-transaction-node",
        },
        classes: txClass,
        type: "application-transaction-node",
      });
      this.capturedIDs.set(tx.id, tx.id);
    }

    // Edge sender -> Application TX
    this.elements.push({
      data: { id: tx.id + tx.sender, target: tx.id, source: tx.sender },
      classes: "application-call" + " " + txClass,
    });

    // Edge Application TX -> Application
    this.elements.push({
      data: {
        id: txDetails["application-id"] + tx.id,
        target: tx.id,
        source: txDetails["application-id"],
      },
      classes: "application-call" + " " + txClass,
    });

    // There may be more than one related account
    for (const acID of txDetails.accounts) {
      // Node account
      if (!this.capturedIDs.has(acID)) {
        this.elements.push({
          data: {
            id: acID,
            label: acID.substring(0, 7),
            distanceFromCenter: 0,
            type: "account-node",
          },
          classes: "account",
          type: "account-node",
        });

        this.capturedIDs.set(acID, acID);
      }

      // Edge acID -> AppTx
      this.elements.push({
        data: {
          id: tx.id + acID,
          source: tx.id,
          target: acID,
        },
        classes: "application-call" + " " + txClass,
      });
    }
  }
}
