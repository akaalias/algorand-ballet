import { AlgorandAPIConfig } from "@/models/AlgorandAPIConfig";
import { AlgorandJSONAPI } from "@/models/AlgorandJSONAPI";
import { TransactionConverter } from "@/models/TransactionConverter";

export class CacheManager {
  public static cache: Map<any, any>;

  constructor() {
    if(CacheManager.cache == null) {
      CacheManager.cache = new Map<any, any>();
      for(const network of AlgorandAPIConfig.apiNetworks) {
        console.log("Setting up cache for " + network.name);
        CacheManager.cache.set(network.name, new Map<string, any>());
      }
    }
  }

  public async get(network: any, accountID: string, focus: any) {
    // Do we have this account yet?
    if(CacheManager.cache.get(network.name) != null) {
      if(CacheManager.cache.get(network.name).get(accountID) != null) {
        return CacheManager.cache.get(network.name).get(accountID).get(focus.focus);
      } else {
        // Get transactions for this account for this network
        const rawTransactions = await AlgorandJSONAPI.getTransactions(accountID, network);
        // Create focus caches now
        const relationships = new TransactionConverter().generateGraphRelationships(accountID, rawTransactions);
        const transactions = new TransactionConverter().generateNetworkTransactions(accountID, rawTransactions);
        // Save focus caches
        CacheManager.cache.get(network.name).set(accountID, new Map<string, any>());
        CacheManager.cache.get(network.name).get(accountID).set("graph", relationships);
        CacheManager.cache.get(network.name).get(accountID).set("network", transactions);
      }
    }

    return CacheManager.cache.get(network.name).get(accountID).get(focus.focus);
  }
}