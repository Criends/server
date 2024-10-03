import { PrismaService } from './../../prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DActivity,
  DAdditionalResume,
  DCareer,
  DCertificate,
  DGetAllResumes,
  DIntroduce,
  DResumeInfo,
  DSite,
  SortResume,
} from './resume.dto';

@Injectable()
export class ResumeService {
  constructor(private readonly prismaService: PrismaService) {}

  //단일 이력서 조회
  async getResume(id: string) {
    const resume = await this.prismaService.resume.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        likes: true,
        proposal: true,
        resumeInfo: true,
        introduce: { orderBy: { index: 'asc' } },
        activity: { orderBy: { index: 'asc' } },
        certificate: { orderBy: { index: 'asc' } },
        career: { orderBy: { index: 'asc' } },
        site: { orderBy: { index: 'asc' } },
        additionalResume: { orderBy: { index: 'asc' } },
      },
    });

    if (!resume) throw new NotFoundException('이력서가 존재하지 않습니다.');

    return resume;
  }

  //다수 이력서 조회
  async getAllResumes(data: DGetAllResumes) {
    let orderByField: object;

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

    const resumes = await this.prismaService.resume.findMany({
      where: {
        expose: data.expose,
      },
      orderBy: orderByField,
    });

    return resumes;
  }

  async deleteItem(itemId: string, userId: string) {
    let target: string;

    if (itemId.startsWith('introduce')) target = 'introduce';
    else if (itemId.startsWith('activity')) target = 'activity';
    else if (itemId.startsWith('certificate')) target = 'certificate';
    else if (itemId.startsWith('career')) target = 'career';
    else if (itemId.startsWith('site')) target = 'site';
    else if (itemId.startsWith('additional')) target = 'additional';
    else throw new BadRequestException('존재하지 않는 항목입니다.');

    try {
      await this.prismaService[target].delete({
        where: { id: itemId, resumeId: userId },
      });
    } catch {
      throw new NotFoundException('존재하지 않는 항목입니다.');
    }
  }

  // 이력서 개인정보 추가
  async editResumeInfo(dto: DResumeInfo, userId: string) {
    const existing = await this.prismaService.resumeInfo.findUnique({
      where: { id: userId },
    });

    return await this.prismaService.resumeInfo.update({
      where: { id: userId },
      data: {
        name: dto.name ?? existing.name,
        email: dto.email ?? existing.email,
        phone: dto.phone ?? existing.phone,
        address: dto.address ?? existing.address,
        profileImage: dto.profileImage ?? existing.profileImage,
      },
    });
  }

  // 이력서 자기소개 추가
  async editIntroduce(dto: DIntroduce[], userId: string) {
    return await Promise.all(
      dto.map(async (value: DIntroduce) => {
        let existing: DIntroduce;
        if (value.id)
          existing = await this.prismaService.introduce.findUnique({
            where: { id: value.id },
          });

        return await this.prismaService.introduce.upsert({
          where: { id: value.id || 'undefined' },
          create: {
            id: 'introduce' + value.index.toString() + userId,
            resumeId: userId,
            index: value.index,
            title: value.title,
            content: value.content,
          },
          update: {
            index: value.index ?? existing.index,
            title: value.title ?? existing.title,
            content: value.content ?? existing.content,
          },
        });
      }),
    );
  }

  // 이력서 활동 추가
  async editActivity(dto: DActivity[], userId: string) {
    return await Promise.all(
      dto.map(async (value: DActivity) => {
        let existing: DActivity;
        if (value.id)
          existing = await this.prismaService.activity.findUnique({
            where: { id: value.id },
          });

        return await this.prismaService.activity.upsert({
          where: { id: value.id || 'undefined' },
          create: {
            id: 'activity' + value.index.toString() + userId,
            resumeId: userId,
            index: value.index,
            title: value.title,
            content: value.content,
            startDate: value.startDate,
            endDate: value.endDate,
          },
          update: {
            index: value.index ?? existing.index,
            title: value.title ?? existing.title,
            content: value.content ?? existing.content,
            startDate: value.startDate ?? existing.startDate,
            endDate: value.endDate ?? existing.endDate,
          },
        });
      }),
    );
  }

  // 이력서 자격증 추가
  async editCertificate(dto: DCertificate[], userId: string) {
    return await Promise.all(
      dto.map(async (value: DCertificate) => {
        let existing: DCertificate;
        if (value.id)
          existing = await this.prismaService.certificate.findUnique({
            where: { id: value.id },
          });

        return await this.prismaService.certificate.upsert({
          where: { id: value.id ?? 'undefined' },
          create: {
            id: 'certificate' + value.index + userId,
            resumeId: userId,
            index: value.index,
            name: value.name,
            certificateDate: value.certificateDate,
            issuer: value.issuer,
            score: value.score,
            content: value.content,
          },
          update: {
            index: value.index ?? existing?.index,
            name: value.name ?? existing?.name,
            certificateDate: value.certificateDate ?? existing?.certificateDate,
            issuer: value.issuer ?? existing?.issuer,
            score: value.score ?? existing?.score,
            content: value.content ?? existing?.content,
          },
        });
      }),
    );
  }

  // 이력서 경력 추가
  async editCareer(dto: DCareer[], userId: string) {
    return await Promise.all(
      dto.map(async (value: DCareer) => {
        let existing: DCareer;
        if (value.id)
          existing = await this.prismaService.career.findUnique({
            where: { id: value.id },
          });

        return await this.prismaService.career.upsert({
          where: { id: value.id || 'undefined' },
          create: {
            id: 'career' + value.index.toString() + userId,
            resumeId: userId,
            index: value.index,
            company: value.company,
            position: value.position,
            content: value.content,
            startDate: value.startDate,
            endDate: value.endDate,
          },
          update: {
            index: value.index ?? existing.index,
            company: value.company ?? existing.company,
            position: value.position ?? existing.position,
            content: value.content ?? existing.content,
            startDate: value.startDate ?? existing.startDate,
            endDate: value.endDate ?? existing.endDate,
          },
        });
      }),
    );
  }

  // 이력서 사이트 추가
  async editSite(dto: DSite[], userId: string) {
    return await Promise.all(
      dto.map(async (value: DSite) => {
        let existing: DSite;
        if (value.id)
          existing = await this.prismaService.site.findUnique({
            where: { id: value.id },
          });

        return await this.prismaService.site.upsert({
          where: { id: value.id || 'undefined' },
          create: {
            id: 'site' + value.index.toString() + userId,
            resumeId: userId,
            index: value.index,
            title: value.title,
            content: value.content,
            url: value.url,
          },
          update: {
            index: value.index ?? existing.index,
            title: value.title ?? existing.title,
            content: value.content ?? existing.content,
            url: value.url ?? existing.url,
          },
        });
      }),
    );
  }

  // 이력서 추가사항 추가
  async editAdditionalResume(dto: DAdditionalResume[], userId: string) {
    return await Promise.all(
      dto.map(async (value: DAdditionalResume) => {
        let existing: DAdditionalResume;
        if (value.id)
          existing = await this.prismaService.additionalResume.findUnique({
            where: { id: value.id },
          });

        return await this.prismaService.additionalResume.upsert({
          where: {
            id: value.id ?? 'undefined',
          },
          create: {
            id: 'additional' + value.index.toString() + userId,
            resumeId: userId,
            index: value.index,
            title: value.title,
            content: value.content,
          },
          update: {
            index: value.index ?? existing.index,
            title: value.title ?? existing.title,
            content: value.content ?? existing.content,
          },
        });
      }),
    );
  }
}
