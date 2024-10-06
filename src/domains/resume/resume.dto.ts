import { ExposeRange } from '@prisma/client';
import { IsEnum } from 'class-validator';

export enum SortResume {
  UPDATED_AT = 'UPDATED_AT',
  PROPOSAL = 'PROPOSAL',
  LIKES = 'LIKES',
}

export class DResume {
  id?: string;
  likes?: number;
  title: string;
  expose: ExposeRange;
  proposal?: number;
  updatedAt?: Date;
  resumeInfo: DPersonnelInfo;
  introduce?: DIntroduce[];
  activity?: DActivity[];
  certificate?: DCertificate[];
  career?: DCareer[];
  site?: DSite[];
  additionalResume?: DAdditionalResume[];
}

export class DResumeInfo {
  title?: string;
  expose?: ExposeRange;
}
export class DPersonnelInfo {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  profileImage?: string;
}

export class DIntroduce {
  id?: string;
  resumeId?: string;
  index: number;
  title: string;
  content: string;
}

export class DActivity {
  id?: string;
  resumeId?: string;
  index: number;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
}

export class DCertificate {
  id?: string;
  resumeId?: string;
  index?: number;
  name?: string;
  certificateDate?: string;
  issuer: string;
  score?: string;
  content?: string;
}

export class DCareer {
  id?: string;
  resumeId?: string;
  index: number;
  company: string;
  position: string;
  content: string;
  startDate: string;
  endDate: string;
}

export class DSite {
  id?: string;
  resumeId?: string;
  index: number;
  title: string;
  content?: string;
  url: string;
}

export class DAdditionalResume {
  id?: string;
  resumeId?: string;
  index: number;
  title: string;
  content: string;
}

export class DGetAllResumes {
  @IsEnum(SortResume)
  sort: SortResume;

  // @IsNumber()
  // page: number;

  // @IsNumber()
  // count: number;

  @IsEnum(ExposeRange)
  expose: ExposeRange;
}
