import { AlgorandAPIConfig } from "@/models/AlgorandAPIConfig";

export class AlgorandJSONAPI {

  private static defaultLimit: number = 1000;

  public static async getTransactions(rootAccountID: string, network: any) {
    const requestURL = `https://${network.domain}/idx2/v2/accounts/${rootAccountID}/transactions?limit=${this.defaultLimit}`;

    const response = await fetch(requestURL, {
      method: "GET",
      headers: { accept: "application/json", "x-api-key": AlgorandAPIConfig.key },
    });

    const jsonData = await response.json();
    const transactions = jsonData.transactions;
    return transactions;
  }
}