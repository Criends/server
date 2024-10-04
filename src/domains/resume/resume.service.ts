import { PrismaService } from './../../prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DActivity,
  DAdditionalResume,
  DCareer,
  DCertificate,
  DGetAllResumes,
  DIntroduce,
  DPersonnelInfo,
  DResume,
  DSite,
  SortResume,
} from './resume.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class ResumeService {
  constructor(private readonly prismaService: PrismaService) {}

  //TODO: expose 범위에 따라 반환 여부 수정
  //단일 이력서 조회
  async getResume(id: string) {
    const resume = await this.prismaService.resume.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        likes: true,
        proposal: true,
        personnelInfo: true,
        introduce: { orderBy: { index: 'asc' } },
        activity: { orderBy: { index: 'asc' } },
        certificate: { orderBy: { index: 'asc' } },
        career: { orderBy: { index: 'asc' } },
        site: { orderBy: { index: 'asc' } },
        additionalResume: { orderBy: { index: 'asc' } },
        expose: true,
      },
    });

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
    else if (itemId.startsWith('additionalResume')) target = 'additional';
    else throw new BadRequestException('존재하지 않는 항목입니다.');

    try {
      await this.prismaService[target].delete({
        where: { id: itemId, resumeId: userId },
      });
    } catch {
      throw new NotFoundException('존재하지 않는 항목입니다.');
    }
  }

  //이력서 초기화
  async resetResume(resumeId: string, userId: string) {
    if (resumeId !== userId)
      throw new UnauthorizedException('삭제 권한이 없습니다.');

    const target: string[] = [
      'resumeInfo',
      'introduce',
      'activity',
      'certificate',
      'career',
      'site',
      'additionalResume',
    ];

    await Promise.all(
      target.map(async (value: string) => {
        try {
          await this.prismaService[value].deleteMany({
            where: { resumeId: userId },
          });
        } catch {}
      }),
    );
  }

  async editResume(dto: DResume, userId: string) {
    const existing = await this.prismaService.resume.findUnique({
      where: { id: userId },
    });

    return await this.prismaService.resume.update({
      where: { id: userId },
      data: {
        title: dto.title ?? existing.title,
        expose: dto.expose ?? existing.expose,
        updatedAt: new Date(),
      },
    });
  }

  //TODO: null로 인해 오류 발생! 수정 로직 필요
  // 이력서 개인정보 추가
  async editPersonnelInfo(dto: DPersonnelInfo, userId: string) {
    const existing = await this.prismaService.personnelInfo.findUnique({
      where: { id: dto.id },
    });

    return await this.prismaService.personnelInfo.upsert({
      where: { id: dto.id },
      create: {
        id: userId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        profileImage: dto.profileImage,
      },
      update: {
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
            id: 'introduce' + userId + '_' + nanoid(4),
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
            id: 'activity' + userId + '_' + nanoid(4),
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
            id: 'certificate' + userId + '_' + nanoid(4),
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
            id: 'career' + userId + '_' + nanoid(4),
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
            id: 'site' + userId + '_' + nanoid(4),
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
            id: 'additionalResume' + userId + '_' + nanoid(4),
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

  async likeUnlikeResume(resumeId: string, userId: string) {
    if (resumeId === userId)
      throw new BadRequestException(
        '본인의 이력서에는 좋아요를 누를 수 없습니다.',
      );

    const check = await this.prismaService.likeResume.findUnique({
      where: { userId_resumeId: { userId, resumeId } },
    });

    if (!check) {
      await this.prismaService.resume.update({
        where: { id: resumeId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
      return await this.prismaService.likeResume.create({
        data: { resumeId: resumeId, userId: userId },
      });
    } else {
      await this.prismaService.resume.update({
        where: { id: resumeId },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });
      return await this.prismaService.likeResume.delete({
        where: { userId_resumeId: { userId, resumeId } },
      });
    }
  }
}
