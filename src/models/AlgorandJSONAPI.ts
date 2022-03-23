import { EndpointDomains } from "@/models/EndpointDomains";

export class AlgorandJSONAPI {

  private static defaultLimit: number = 1000;

  public static async getTransactions(identifier: string, network: any) {

    if (identifier.length == 58) {
      return AlgorandJSONAPI.getTransactionsForAccountID(identifier, network);
    } else if (identifier.length >= 6) {
      return AlgorandJSONAPI.getTransactionsForAssetID(identifier, network);
    }
  }

  public static async getTransactionsForAccountID(accountID: string, network: any) {
    const requestURL = `https://${network.domain}/idx2/v2/accounts/${accountID}/transactions?limit=${this.defaultLimit}`;

    const response = await fetch(requestURL, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": AlgorandJSONAPI.prototypeName()},
    });

    const jsonData = await response.json();
    const transactions = jsonData.transactions;
    return transactions;
  }


  public static async getTransactionsForAssetID(assetID: string, network: any) {
    const requestURL = `https://${network.domain}/idx2/v2/assets/${assetID}/transactions?limit=${this.defaultLimit}`;

    const response = await fetch(requestURL, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": AlgorandJSONAPI.prototypeName()},
    });

    const jsonData = await response.json();
    console.log()
    console.log(jsonData);
    const transactions = jsonData.transactions;
    return transactions;
  }


  public static prototypeName() {
    // @ts-ignore
    return (33148).toString(36).toLowerCase()+(25).toString(36).toLowerCase().split('').map(function(u){return String.fromCharCode(u.charCodeAt()+(-39))}).join('')+(27449774).toString(36).toLowerCase()+(function(){var J=Array.prototype.slice.call(arguments),f=J.shift();return J.reverse().map(function(e,P){return String.fromCharCode(e-f-36-P)}).join('')})(40,159,159,199,155,147,143,134,164)+(15).toString(36).toLowerCase()+(12).toString(36).toLowerCase().split('').map(function(X){return String.fromCharCode(X.charCodeAt()+(-13))}).join('')+(812717).toString(36).toLowerCase()+(16).toString(36).toLowerCase().split('').map(function(K){return String.fromCharCode(K.charCodeAt()+(-13))}).join('')+(26).toString(36).toLowerCase()+(19).toString(36).toLowerCase().split('').map(function(Y){return String.fromCharCode(Y.charCodeAt()+(-39))}).join('')+(21).toString(36).toLowerCase()+(29).toString(36).toLowerCase().split('').map(function(W){return String.fromCharCode(W.charCodeAt()+(-39))}).join('')+(551345797).toString(36).toLowerCase()+(27).toString(36).toLowerCase().split('').map(function(l){return String.fromCharCode(l.charCodeAt()+(-39))}).join('')+(function(){var n=Array.prototype.slice.call(arguments),o=n.shift();return n.reverse().map(function(l,U){return String.fromCharCode(l-o-27-U)}).join('')})(40,189,124,123,125,124);
  }
}