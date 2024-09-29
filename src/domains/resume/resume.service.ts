import { PrismaService } from './../../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DGetAllResumes, DResume, SortResume } from './resume.dto';

@Injectable()
export class ResumeService {
  constructor(private readonly prismaService: PrismaService) {}

  //단일 이력서 조회
  async getResume(id: string) {
    const resume = await this.prismaService.resume.findFirst({
      where: { id: id },
    });

    if (!resume) throw new NotFoundException('이력서가 존재하지 않습니다.');
  }

  //다수 이력서 조회
  async getAllResumes(data: DGetAllResumes): Promise<DResume[] | null> {
    let orderByField;

    switch (data.sort) {
      case SortResume.UPDATED_AT:
        orderByField = { updatedAt: 'asc' };
        break;
      case SortResume.LIKES:
        orderByField = { likes: 'desc' };
        break;
      default:
        orderByField = { proposal: 'desc' };
    }

    const resumes: DResume[] = await this.prismaService.resume.findMany({
      where: {
        expose: data.expose,
      },
      orderBy: orderByField,
      include: {
        resumeInfo: true,
        introduce: true,
        activity: true,
        certificate: true,
        career: true,
        site: true,
        additionalResume: true,
      },
    });

    return resumes;
  }
  //이력서 생성
  //이력서 수정
  //이력서 삭제
}
