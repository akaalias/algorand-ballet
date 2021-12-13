export class QualitativeResearchApproach {
  public static researchApproaches = [{name: "Transactions", focus: "network", key: "network"}, {name: "Relationships", focus: "graph", key: "graph"}];
  public static defaultResearchApproach = QualitativeResearchApproach.researchApproaches.find(x => x.key === "network");
  public static getResearchApproachForKey(key: string) {
    return QualitativeResearchApproach.researchApproaches.find(x => x.focus === key);
  }
}