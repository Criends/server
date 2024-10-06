import { AccountType } from './../../types/account.type';
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
  DPersonnelInfo,
  DResumeInfo,
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
    const orderByField: object[] = [];

    switch (data.sort) {
      case SortResume.UPDATED_AT:
        orderByField.push({ updatedAt: 'desc' });
        break;
      case SortResume.LIKES:
        orderByField.push({ likes: 'desc' }, { updatedAt: 'desc' });
        break;
      case SortResume.PROPOSAL:
        orderByField.push({ proposal: 'desc' }, { updatedAt: 'desc' });
        break;
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
    const target = this.classifyItem(itemId);

    try {
      await this.prismaService[target].delete({
        where: { id: itemId, resumeId: userId },
      });
    } catch {
      throw new BadRequestException('권한이 없거나 존재하지 않는 항목입니다.');
    }
  }

  //이력서 초기화
  async resetResume(userId: string) {
    const target = [
      'introduce',
      'activity',
      'certificate',
      'career',
      'site',
      'additionalResume',
    ];

    await this.prismaService.$transaction([
      this.prismaService.likeResume.deleteMany({
        where: { resumeId: userId },
      }),
      this.prismaService.resume.update({
        where: { id: userId },
        data: {
          title: null,
          likes: 0,
          expose: 'SECRET',
        },
      }),
      this.prismaService.personnelInfo.update({
        where: { id: userId },
        data: {
          name: '',
          email: '',
          phone: '',
          address: '',
          profileImage: '',
        },
      }),
      ...target.map((table) =>
        this.prismaService[table].deleteMany({
          where: { resumeId: userId },
        }),
      ),
    ]);
  }

  async editInfo(
    branch: string,
    dto: DResumeInfo | DPersonnelInfo,
    userId: string,
  ) {
    const target = this.classifyItem(branch);

    this.updateUpdatedAt(userId);

    await this.prismaService[target].update({
      where: { id: userId },
      data: {
        ...dto,
      },
    });
  }

  // async editResumeInfo(dto: DResumeInfo, userId: string) {
  //   return await this.prismaService.resume.update({
  //     where: { id: userId },
  //     data: {
  //       ...dto,
  //       updatedAt: new Date(),
  //     },
  //   });
  // }

  // async editPersonnelInfo(dto: DPersonnelInfo, userId: string) {
  //   return await this.prismaService.personnelInfo.update({
  //     where: { id: userId },
  //     data: dto,
  //   });
  // }

  async createItem(
    branch: string,
    dto:
      | DIntroduce[]
      | DActivity[]
      | DCertificate[]
      | DCareer[]
      | DSite[]
      | DAdditionalResume[],
    userId: string,
  ) {
    const target = this.classifyItem(branch);

    this.updateUpdatedAt(userId);

    await Promise.all(
      dto.map(async (value) => {
        await this.prismaService[target].create({
          data: {
            id: target + nanoid(4) + userId,
            resumeId: userId,
            ...value,
          },
        });
      }),
    );
  }

  async editItem(
    branch: string,
    dto:
      | DIntroduce[]
      | DActivity[]
      | DCertificate[]
      | DCareer[]
      | DSite[]
      | DAdditionalResume[],
    userId: string,
  ) {
    const target = this.classifyItem(branch);

    this.updateUpdatedAt(userId);

    await Promise.all(
      dto.map(async (value) => {
        const existing = await this.prismaService[target].findUnique({
          where: { id: value.id },
        });

        if (!existing)
          throw new NotFoundException(value, '는 존재하지 않는 항목입니다.');

        await this.prismaService[target].update({
          where: { id: value.id },
          data: { ...value },
        });
      }),
    );
  }

  classifyItem(target: string) {
    let result: string;
    if (target.startsWith('introduce')) {
      result = 'introduce';
    } else if (target.startsWith('activity')) {
      result = 'activity';
    } else if (target.startsWith('certificate')) {
      result = 'certificate';
    } else if (target.startsWith('career')) {
      result = 'career';
    } else if (target.startsWith('site')) {
      result = 'site';
    } else if (target.startsWith('additional')) {
      result = 'additionalResume';
    } else if (target.startsWith('personnel-info')) {
      result = 'personnelInfo';
    } else if (target.startsWith('resume-info')) {
      result = 'resume';
    } else throw new BadRequestException('존재하지 않는 항목입니다.');

    return result;
  }

  async updateUpdatedAt(userId: string) {
    return await this.prismaService.resume.update({
      where: { id: userId },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  // // 이력서 자기소개 추가
  // async editIntroduce(dto: DIntroduce[], userId: string) {
  //   return await Promise.all(
  //     dto.map(async (value: DIntroduce) => {
  //       let existing: DIntroduce;
  //       if (value.id)
  //         existing = await this.prismaService.introduce.findUnique({
  //           where: { id: value.id },
  //         });
  //       if (existing)
  //         return await this.prismaService.introduce.update({
  //           where: { id: value.id },
  //           data: value,
  //         });
  //       else
  //         return await this.prismaService.introduce.create({
  //           data: {
  //             id: 'introduce' + userId + '_' + nanoid(4),
  //             resumeId: userId,
  //             ...value,
  //           },
  //         });
  //     }),
  //   );
  // }

  // // 이력서 활동 추가
  // async editActivity(dto: DActivity[], userId: string) {
  //   return await Promise.all(
  //     dto.map(async (value: DActivity) => {
  //       let existing: DActivity;
  //       if (value.id)
  //         existing = await this.prismaService.activity.findUnique({
  //           where: { id: value.id },
  //         });

  //       return await this.prismaService.activity.upsert({
  //         where: { id: value.id || 'undefined' },
  //         create: {
  //           id: 'activity' + userId + '_' + nanoid(4),
  //           resumeId: userId,
  //           index: value.index,
  //           title: value.title,
  //           content: value.content,
  //           startDate: value.startDate,
  //           endDate: value.endDate,
  //         },
  //         update: {
  //           index: value.index ?? existing.index,
  //           title: value.title ?? existing.title,
  //           content: value.content ?? existing.content,
  //           startDate: value.startDate ?? existing.startDate,
  //           endDate: value.endDate ?? existing.endDate,
  //         },
  //       });
  //     }),
  //   );
  // }

  // // 이력서 자격증 추가
  // async editCertificate(dto: DCertificate[], userId: string) {
  //   return await Promise.all(
  //     dto.map(async (value: DCertificate) => {
  //       let existing: DCertificate;
  //       if (value.id)
  //         existing = await this.prismaService.certificate.findUnique({
  //           where: { id: value.id },
  //         });

  //       return await this.prismaService.certificate.upsert({
  //         where: { id: value.id ?? 'undefined' },
  //         create: {
  //           id: 'certificate' + userId + '_' + nanoid(4),
  //           resumeId: userId,
  //           index: value.index,
  //           name: value.name,
  //           certificateDate: value.certificateDate,
  //           issuer: value.issuer,
  //           score: value.score,
  //           content: value.content,
  //         },
  //         update: {
  //           index: value.index ?? existing?.index,
  //           name: value.name ?? existing?.name,
  //           certificateDate: value.certificateDate ?? existing?.certificateDate,
  //           issuer: value.issuer ?? existing?.issuer,
  //           score: value.score ?? existing?.score,
  //           content: value.content ?? existing?.content,
  //         },
  //       });
  //     }),
  //   );
  // }

  // // 이력서 경력 추가
  // async editCareer(dto: DCareer[], userId: string) {
  //   return await Promise.all(
  //     dto.map(async (value: DCareer) => {
  //       let existing: DCareer;
  //       if (value.id)
  //         existing = await this.prismaService.career.findUnique({
  //           where: { id: value.id },
  //         });

  //       return await this.prismaService.career.upsert({
  //         where: { id: value.id || 'undefined' },
  //         create: {
  //           id: 'career' + userId + '_' + nanoid(4),
  //           resumeId: userId,
  //           index: value.index,
  //           company: value.company,
  //           position: value.position,
  //           content: value.content,
  //           startDate: value.startDate,
  //           endDate: value.endDate,
  //         },
  //         update: {
  //           index: value.index ?? existing.index,
  //           company: value.company ?? existing.company,
  //           position: value.position ?? existing.position,
  //           content: value.content ?? existing.content,
  //           startDate: value.startDate ?? existing.startDate,
  //           endDate: value.endDate ?? existing.endDate,
  //         },
  //       });
  //     }),
  //   );
  // }

  // // 이력서 사이트 추가
  // async editSite(dto: DSite[], userId: string) {
  //   return await Promise.all(
  //     dto.map(async (value: DSite) => {
  //       let existing: DSite;
  //       if (value.id)
  //         existing = await this.prismaService.site.findUnique({
  //           where: { id: value.id },
  //         });

  //       return await this.prismaService.site.upsert({
  //         where: { id: value.id || 'undefined' },
  //         create: {
  //           id: 'site' + userId + '_' + nanoid(4),
  //           resumeId: userId,
  //           index: value.index,
  //           title: value.title,
  //           content: value.content,
  //           url: value.url,
  //         },
  //         update: {
  //           index: value.index ?? existing.index,
  //           title: value.title ?? existing.title,
  //           content: value.content ?? existing.content,
  //           url: value.url ?? existing.url,
  //         },
  //       });
  //     }),
  //   );
  // }

  // // 이력서 추가사항 추가
  // async editAdditionalResume(dto: DAdditionalResume[], userId: string) {
  //   return await Promise.all(
  //     dto.map(async (value: DAdditionalResume) => {
  //       let existing: DAdditionalResume;
  //       if (value.id)
  //         existing = await this.prismaService.additionalResume.findUnique({
  //           where: { id: value.id },
  //         });

  //       return await this.prismaService.additionalResume.upsert({
  //         where: {
  //           id: value.id ?? 'undefined',
  //         },
  //         create: {
  //           id: 'additionalResume' + userId + '_' + nanoid(4),
  //           resumeId: userId,
  //           index: value.index,
  //           title: value.title,
  //           content: value.content,
  //         },
  //         update: {
  //           index: value.index ?? existing.index,
  //           title: value.title ?? existing.title,
  //           content: value.content ?? existing.content,
  //         },
  //       });
  //     }),
  //   );
  // }

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
