export class DProject {
  id: string;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  repImages: string;
  team: DTeam[];
  skills: DSkill[];
  contributions: DContribution[];
  troubleShootings: DTroubleShooting[];
  additionalPortfolios: DAdditionalPortfolio[];
}
export class DProjectInfo {
  title?: string;
  content: string;
  startDate: string;
  endDate: string;
  repImages: string;
}

export class DTeam {
  id: string;
  index: number;
  projectId: string;
  role: string;
  headCount: number;
}

export class DSkill {
  id: string;
  index: number;
  projectId: string;
  position: string;
  content: string;
}

export class DProjectSite {
  id: string;
  index: number;
  projectId: string;
  site: string;
  url: string;
}

export class DContribution {
  id: string;
  index: number;
  projectId: string;
  contribution: string;
  content: string;
}

export class DTroubleShooting {
  id: string;
  index: number;
  projectId: string;
  trouble: string;
  content: string;
}

export class DAdditionalPortfolio {
  id: string;
  index: number;
  projectId: string;
  title: string;
  content: string;
}
