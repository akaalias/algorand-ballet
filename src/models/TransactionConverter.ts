import { ColorHelper } from "@/models/ColorHelper";

export class TransactionConverter {
  private elements: Array<any>;
  private capturedIDs: Map<string, string>;
  private capturedEdges: Map<string, string>;
  private assetColors: Map<string, string>;

  constructor() {
    this.elements = [];
    this.capturedIDs = new Map();
    this.capturedEdges = new Map();
    this.assetColors = new Map();
  }

  public generateGraphRelationships(rootAccountID: string, transactions: Array<any>) {

    this.setRootNodeInElements(rootAccountID);

    if (transactions != null) {
      for (const tx of transactions) {
        // Add Sender Node regardless of what kind of TX it is
        this.addSenderNode(tx);
        if (tx["tx-type"] === "pay") {
          this.handleGraphPaymentTransaction(tx);
        } else if (tx["tx-type"] === "axfer") {
          this.handleGraphAssetTransferTransaction(tx);
        } else if (tx["tx-type"] === "appl") {
          this.handleGraphApplicationTransaction(tx);
        }
      }
    }

    return this.elements;
  }
  public generateNetworkTransactions(rootAccountID: string, transactions: Array<any>) {
    this.setRootNodeInElements(rootAccountID);
    if (transactions != null) {
      for (const tx of transactions) {
        if (tx["payment-transaction"] != null) {
          this.handleNetworkPaymentTransaction(tx);
        } else if (tx["asset-transfer-transaction"] != null) {
          this.handleNetworkAssetTransferTransaction(tx);
        } else if (tx["tx-type"] == "appl") {
          this.handleNetworkApplicationTransaction(tx);
        } else {
          continue;
        }
      }
      return this.elements;
    }
  }
  public generateNetworkDiversities(rootAccountID: string, transactions: Array<any>) {
    this.setRootNodeInElements(rootAccountID);
    const rootNode = this.capturedIDs.get(rootAccountID);

    // What I want is...
    // make a line between two wallets for each transaction
    // each asset has its own color
    if (transactions != null) {
      for (const tx of transactions) {
        if (tx["payment-transaction"] != null) {
          const txDetails = tx["payment-transaction"];

          // Add sender node
          if (!this.capturedIDs.has(tx.sender)) {
            this.elements.push({
              data: {
                id: tx.sender,
                label: tx.sender.substring(0, 7),
                distanceFromCenter: 0,
                type: "account-node",
              },
              classes: "account",
            });
            this.capturedIDs.set(tx.sender, tx.sender);
          }

          // Add receiver node
          if (!this.capturedIDs.has(txDetails.receiver)) {
            this.elements.push({
              data: {
                id: txDetails.receiver,
                label: txDetails.receiver.substring(0, 7),
                distanceFromCenter: 0,
                type: "account-node",
              },
              classes: "account",
            });
            this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
          }

          // Directly connect Algorand sender and receiver
          this.elements.push({
            data: {
              id: tx.sender + txDetails.receiver +  Math.floor(Math.random() * 10000),
              target: tx.sender,
              source: txDetails.receiver
            },
            classes: "unbundled-bezier algorand-payment payment-transaction",
            type: "payment-transaction-edge",
          });

        } else if (tx["asset-transfer-transaction"] != null) {
          const txDetails = tx["asset-transfer-transaction"];
          const assetID = txDetails["asset-id"];

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
          }

          // Add receiver node
          if (!this.capturedIDs.has(txDetails.receiver)) {
            this.elements.push({
              data: {
                id: txDetails.receiver,
                label: txDetails.receiver.substring(0, 7),
                distanceFromCenter: 0,
                type: "account-node",
              },
              classes: "account",
            });
            this.capturedIDs.set(txDetails.receiver, txDetails.receiver);
          }

          // Directly connect Algorand sender and receiver
          this.elements.push({
            data: {
              id: tx.sender + txDetails.receiver +  Math.floor(Math.random() * 10000),
              target: tx.sender,
              source: txDetails.receiver,
            },
            classes: "unbundled-bezier",
            style: {
              "line-color": this.getLineColorForAssetID(assetID),
            }
          });


          // if otherwise we'd have a dangling asset node
          if(rootAccountID.length < 58) {
            this.elements.push({
              data: {
                id: tx.sender + rootAccountID +  Math.floor(Math.random() * 10000),
                target: tx.sender,
                source: rootAccountID,
              },
              classes: "unbundled-bezier",
              style: {
                "line-color": this.getLineColorForAssetID(rootAccountID),
              }
            });
          }

        } else {
          continue;
        }
      }
    }
    return this.elements;
  }

  private getLineColorForAssetID(assetID: string){
    // return ColorHelper.generateRandomHexColor();
    if(!this.assetColors.has(assetID)) {
      const randomAssetColor = ColorHelper.generateRandomHexColor();
      this.assetColors.set(assetID, randomAssetColor);
      return randomAssetColor;
    } else {
      return this.assetColors.get(assetID);
    }
  }

  private setRootNodeInElements(rootAccountID: string) {

    let typeString = "account-node"
    if(rootAccountID.length < 58) {
      typeString = "asset"
    }

    // Root Node
    this.elements.push({
      data: {
        id: rootAccountID,
        label: rootAccountID.substring(0, 7),
        distanceFromCenter: 300,
        type: typeString,
      },
      classes: "root",
    });
    this.capturedIDs.set(rootAccountID, rootAccountID);
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
    }
  }
  private handleGraphPaymentTransaction(tx: any) {
    const senderID = tx.sender;
    const txDetails = tx["payment-transaction"];
    const receiverID = txDetails.receiver

    // Receiver Node
    if (!this.capturedIDs.has(receiverID)) {
      this.elements.push({
        data: {
          id: receiverID,
          label: receiverID.substring(0, 7),
          type: "account-node",
        },
        classes: "account",
        type: "account-node",
      });
      this.capturedIDs.set(receiverID, receiverID);
    }

    let senderReceiverEdge = senderID + "-" + receiverID;
    const reverseSenderReceiverEdge = receiverID + "-" + senderID

    // Avoid adding an extra edge
    if (this.capturedEdges.has(reverseSenderReceiverEdge)) {
      senderReceiverEdge = reverseSenderReceiverEdge
    }

    if (!this.capturedEdges.has(senderReceiverEdge)) {
      // Looping Edges
      if (senderID === receiverID) {
        this.elements.push({
          data: {
            id: senderReceiverEdge,
            target: senderID,
            source: receiverID,
            weight: 1,
          },
          classes: "loop",
        });
      } else {
        this.elements.push({
          data: {
            id: senderReceiverEdge,
            target: senderID,
            source: receiverID,
            weight: 1,
          },
          classes: "payment-relationship",
        });
      }

      this.capturedEdges.set(senderReceiverEdge, senderReceiverEdge);
    } else {
      const objIndex = this.elements.findIndex(
        (obj) => obj.data.id === senderReceiverEdge
      );
      this.elements[objIndex].data.weight += 1;
    }
  }
  private handleGraphAssetTransferTransaction(tx: any) {
    const txDetails = tx["asset-transfer-transaction"];
    const senderID = tx.sender;
    const receiverID = txDetails.receiver;
    const assetID = txDetails["asset-id"];

    if(senderID === receiverID) {
      // Add Asset Node
      if (!this.capturedIDs.has(assetID)) {
        this.elements.push({
          data: {
            id: assetID,
            label: "ASA " + assetID,
            type: "asset-node",
          },
          classes: "asset",
        });
        this.capturedIDs.set(assetID, assetID);
      }

      // Self-Loop
      const selfEdge = senderID + "-" + receiverID;
      if(!this.capturedEdges.has(selfEdge)) {
        this.elements.push({
          data: {
            id: selfEdge,
            target: senderID,
            source: receiverID,
            weight: 1,
          },
          classes: "asset-relationship-loop asset-relationship",
        });

        this.capturedEdges.set(selfEdge, selfEdge);
      } else {
        const objIndex = this.elements.findIndex(
          (obj) => obj.data.id === selfEdge
        );

        this.elements[objIndex].data.weight += 1;
      }


      // Add relationship sender -> asset
      let senderToAssetEdge = senderID + "-" + assetID;
      if (!this.capturedEdges.has(senderToAssetEdge)) {
        this.elements.push({
          data: {
            id: senderToAssetEdge,
            target: assetID,
            source: senderID,
            weight: 1,
          },
          classes: "asset-relationship",
        });

        this.capturedEdges.set(
          senderToAssetEdge,
          senderToAssetEdge
        );
      } else {
        const objIndex = this.elements.findIndex(
          (obj) => obj.data.id === senderToAssetEdge
        );
        this.elements[objIndex].data.weight += 1;
      }

    } else {
      // Add Asset Node
      if (!this.capturedIDs.has(assetID)) {
        this.elements.push({
          data: {
            id: assetID,
            label: "ASA " + assetID,
            type: "asset-node",
          },
          classes: "asset",
        });
        this.capturedIDs.set(assetID, assetID);
      }

      // Add relationship sender -> asset
      let senderToAssetEdge = senderID + "-" + assetID;
      if (!this.capturedEdges.has(senderToAssetEdge)) {
        this.elements.push({
          data: {
            id: senderToAssetEdge,
            target: assetID,
            source: senderID,
            weight: 1,
          },
          classes: "asset-relationship",
        });

        this.capturedEdges.set(
          senderToAssetEdge,
          senderToAssetEdge
        );
      } else {
        const objIndex = this.elements.findIndex(
          (obj) => obj.data.id === senderToAssetEdge
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
      const receiverToAssetEdge = receiverID + "-" + assetID;
      if (!this.capturedEdges.has(receiverToAssetEdge)) {
        this.elements.push({
          data: {
            id: receiverToAssetEdge,
            target: assetID,
            source: receiverID,
            weight: 1,
          },
          classes: "asset-relationship",
        });

        this.capturedEdges.set(receiverToAssetEdge, receiverToAssetEdge);
      } else {
        const objIndex = this.elements.findIndex(
          (obj) => obj.data.id === receiverToAssetEdge
        );
        this.elements[objIndex].data.weight += 1;
      }

      // Add Sender -> Receiver Edge
      let senderToReceiverEdge = senderID + "-" + receiverID
      const inverseSenderToReceiverEdge = receiverID + "-" + senderID

      if(this.capturedEdges.has(inverseSenderToReceiverEdge)) {
        senderToReceiverEdge = inverseSenderToReceiverEdge
      }

      if(!this.capturedEdges.has(senderToReceiverEdge)) {
        this.elements.push({
          data: {
            id: senderToReceiverEdge,
            target: receiverID,
            source: senderID,
            weight: 1,
          },
          classes: "asset-relationship",
        });

        this.capturedEdges.set(senderToReceiverEdge, senderToReceiverEdge);
      } else {
        const objIndex = this.elements.findIndex(
          (obj) => obj.data.id === senderToReceiverEdge
        );

        this.elements[objIndex].data.weight += 1;
      }
    }
  }
  private handleGraphApplicationTransaction(tx: any) {
    const txDetails = tx["application-transaction"];
    const applicationID = txDetails["application-id"];

    // Add Application Node
    if (!this.capturedIDs.has(applicationID)) {
      this.elements.push({
        data: {
          id: applicationID,
          label: "APP " + applicationID,
          type: "application-node",
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
  private handleNetworkPaymentTransaction(tx: any) {
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
  private handleNetworkAssetTransferTransaction(tx: any) {
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
  private handleNetworkApplicationTransaction(tx: any) {
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