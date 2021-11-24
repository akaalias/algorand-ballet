export class QualitativeResearchApproach {
  public static researchApproaches = [{name: "Transactions", focus: "network"}, {name: "Relationships", focus: "graph"}];
  public static defaultResearchApproach = QualitativeResearchApproach.researchApproaches.find(x => x.focus === "graph");
}