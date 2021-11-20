export class AlgorandGraphAPI {
  apiKey: string;
  networkDomain: string;
  nameToAccountIDMap: Map<any, any>;
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
    this.setRootNodeInElements(rootAccountID);
    console.log("In graphForRootAccountID()");
    console.log("In graphForRootAccountID() – this.elements: ");

    const transactions = await this.getTransactions(rootAccountID);

    if (transactions != null) {
      console.log("Transactions from API: ");
      console.log(transactions);
      for (const tx of transactions) {
        // Add sender Node
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
          console.log("Not adding new sender node b/c already seen.");
        }

        // Handle payment and asset TXs
        if (tx["tx-type"] === "pay" || tx["tx-type"] === "axfer") {
          let txDetails: any;
          if (tx["tx-type"] === "pay") {
            txDetails = tx["payment-transaction"];
          } else if (tx["tx-type"] === "axfer") {
            txDetails = tx["asset-transfer-transaction"];
          }

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
            console.log(
              "Not adding new payment-transaction receiver b/c already seen."
            );
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
              console.log("Have to create a LOOP edge!");
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
                classes: "relationship",
              });
            }

            this.capturedEdges.set(compoundEdgeID, compoundEdgeID);
          } else {
            console.log("Edge exists! Need to UPDATE this edge");
            const objIndex = this.elements.findIndex(
              (obj) => obj.data.id === compoundEdgeID
            );
            this.elements[objIndex].data.weight += 1;
          }
        }

        // Handle application TXs
        // Add
        if (tx["tx-type"] === "appl") {
          const txDetails = tx["application-transaction"];
          const applicationID = txDetails["application-id"];

          console.log("applicationID: " + applicationID);

          // Add Application Node
          if(!this.capturedIDs.has(applicationID)) {
            this.elements.push({
              data: {
                id: applicationID,
                label: "APP " + applicationID,
              },
              classes: "application",
            });
            this.capturedIDs.set(
              applicationID,
              applicationID
            );
          }

          const compoundSenderApplicationEdge = tx.sender + "-" + applicationID;
          if(!this.capturedEdges.has(compoundSenderApplicationEdge)) {
            this.elements.push({
              data: {
                id: compoundSenderApplicationEdge,
                target: tx.sender,
                source: applicationID,
                weight: 1,
              },
              classes: "application-relationship",
            });
          } else {
            const objIndex = this.elements.findIndex(
              (obj) => obj.data.id === compoundSenderApplicationEdge
            );
            this.elements[objIndex].data.weight += 1;
          }

          for (const applicationTransactionAccountID of txDetails["accounts"]) {
            // Add involved accounts
            if (!this.capturedIDs.has(applicationTransactionAccountID)) {
              this.elements.push({
                data: {
                  id: applicationTransactionAccountID,
                  label: applicationTransactionAccountID.substring(0, 7),
                },
                classes: "account",
              });
              this.capturedIDs.set(
                applicationTransactionAccountID,
                applicationTransactionAccountID
              );
            } else {
              console.log(
                "Not adding this application-transaction accountID b/c we already know it"
              );
            }

            const compoundEdgeID =
              tx.sender +
              "-" +
              applicationTransactionAccountID +
              "-" +
              txDetails["application-id"];
            if (!this.capturedEdges.has(compoundEdgeID)) {
              this.elements.push({
                data: {
                  id: compoundEdgeID,
                  target: tx.sender,
                  source: applicationTransactionAccountID,
                  weight: 1,
                },
                classes: "application-relationship",
              });
            } else {
              console.log("Edge exists! Need to UPDATE this edge");
              const objIndex = this.elements.findIndex(
                (obj) => obj.data.id === compoundEdgeID
              );
              this.elements[objIndex].data.weight += 1;
            }


            // Add relationship between involved applicationTransactionAccountID to Application
            const compoundAccountApplicationEdge = applicationTransactionAccountID + "-" + applicationID;
            if(!this.capturedEdges.has(compoundAccountApplicationEdge)) {
              this.elements.push({
                data: {
                  id: compoundAccountApplicationEdge,
                  target: applicationID,
                  source: applicationTransactionAccountID,
                  weight: 1,
                },
                classes: "application-relationship",
              });
            } else {
              const objIndex = this.elements.findIndex(
                (obj) => obj.data.id === compoundAccountApplicationEdge
              );
              this.elements[objIndex].data.weight += 1;
            }
          }
        }
      }
    }

    console.log("Elements before returning:");
    console.log(this.elements);
    return this.elements;
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
      classes: "root rootAccount",
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
