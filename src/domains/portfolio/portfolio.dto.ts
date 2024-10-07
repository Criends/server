export class DProject {
  id?: string;
  title?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  repImages?: string;
  team?: DTeam[];
  skills?: DSkill[];
  contributions?: DContribution[];
  troubleShootings?: DTroubleShooting[];
  additionalPortfolios?: DAdditionalPortfolio[];
}
export class DProjectInfo {
  title?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  repImages?: string;
}

export class DTeam {
  id?: string;
  projectId?: string;
  index?: number;
  role?: string;
  headCount?: number;
}

export class DSkill {
  id?: string;
  projectId?: string;
  index?: number;
  position?: string;
  content?: string;
}

export class DProjectSite {
  id?: string;
  projectId?: string;
  index?: number;
  site?: string;
  url?: string;
}

export class DContribution {
  id?: string;
  projectId?: string;
  index?: number;
  contribution?: string;
  content?: string;
}

export class DTroubleShooting {
  id?: string;
  projectId?: string;
  index?: number;
  trouble?: string;
  content?: string;
}

export class DAdditionalPortfolio {
  id?: string;
  projectId?: string;
  index?: number;
  title?: string;
  content?: string;
}
