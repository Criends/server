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
  DResumeInfo,
  DResumeOrder,
  DSite,
  SortResume,
} from './resume.dto';
import { nanoid } from 'nanoid';
import { error } from 'console';

@Injectable()
export class ResumeService {
  constructor(private readonly prismaService: PrismaService) {}

  //TODO: expose 범위에 따라 반환 여부 수정
  //단일 이력서 조회
  async getResume(id: string) {
    const order = await this.prismaService.resume.findUnique({
      where: { id },
      select: {
        personnelInfoIndex: true,
        introduceIndex: true,
        activityIndex: true,
        certificateIndex: true,
        careerIndex: true,
        siteIndex: true,
        additionalResumeIndex: true,
      },
    });

    const sections = [
      { key: 'personnelInfo', index: order.personnelInfoIndex },
      { key: 'introduce', index: order.introduceIndex },
      { key: 'activity', index: order.activityIndex },
      { key: 'certificate', index: order.certificateIndex },
      { key: 'career', index: order.careerIndex },
      { key: 'site', index: order.siteIndex },
      { key: 'additionalResume', index: order.additionalResumeIndex },
    ];

    sections.sort((a, b) => a.index - b.index);

    const selectObject: any = {
      id: true,
      title: true,
      likes: true,
      proposal: true,
      expose: true,
    };

    sections.forEach((section) => {
      if (section.key === 'personnelInfo') {
        selectObject[section.key] = true;
      } else {
        selectObject[section.key] = { orderBy: { index: 'asc' } };
      }
    });

    const resume = await this.prismaService.resume.findUnique({
      where: { id },
      select: selectObject,
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
      select: {
        id: true,
        likes: true,
        title: true,
        expose: true,
        proposal: true,
        updatedAt: true,
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
      if (itemId.endsWith(userId))
        throw new NotFoundException('존재하지 않는 항목입니다.');
      else throw new UnauthorizedException('권한이 없습니다.');
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

    await this.updateUpdatedAt(userId);

    return await this.prismaService[target].update({
      where: { id: userId },
      data: {
        ...dto,
      },
    });
  }

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

    await this.updateUpdatedAt(userId);

    return await Promise.all(
      dto.map(async (value) => {
        return await this.prismaService[target].create({
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

    await this.updateUpdatedAt(userId);

    return await Promise.all(
      dto.map(async (value) => {
        try {
          return await this.prismaService[target].update({
            where: { id: value.id },
            data: { ...value },
          });
        } catch {
          if (value.endsWith(userId))
            throw new NotFoundException('존재하지 않는 항목입니다.');
          else throw new UnauthorizedException('권한이 없습니다.');
        }
      }),
    );
  }

  classifyItem(target: string): string {
    if (target.startsWith('introduce')) return 'introduce';
    else if (target.startsWith('activity')) return 'activity';
    else if (target.startsWith('certificate')) return 'certificate';
    else if (target.startsWith('career')) return 'career';
    else if (target.startsWith('site')) return 'site';
    else if (target.startsWith('additional')) return 'additionalResume';
    else if (target.startsWith('personnel-info')) return 'personnelInfo';
    else if (target.startsWith('resume-info')) return 'resume';
    else throw new BadRequestException('존재하지 않는 항목입니다.');
  }

  async updateUpdatedAt(userId: string) {
    return await this.prismaService.resume.update({
      where: { id: userId },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  async likeUnlikeResume(resumeId: string, userId: string) {
    if (resumeId === userId)
      throw new UnauthorizedException(
        '본인의 이력서에는 좋아요를 누를 수 없습니다.',
      );

    const check = await this.prismaService.likeResume.findUnique({
      where: { userId_resumeId: { userId, resumeId } },
    });

    let likesLogic = {};

    if (!check) {
      likesLogic = { increment: 1 };
      await this.prismaService.likeResume.create({
        data: { resumeId: resumeId, userId: userId },
      });
    } else {
      likesLogic = { decrement: 1 };
      await this.prismaService.likeResume.delete({
        where: { userId_resumeId: { userId, resumeId } },
      });
    }

    await this.prismaService.resume.update({
      where: { id: resumeId },
      data: {
        likes: likesLogic,
      },
    });
  }

  async editItemOrder(resumeId: string, userId: string, order: DResumeOrder) {
    try {
      return await this.prismaService.resume.update({
        where: { id: resumeId },
        data: { ...order },
      });
    } catch {
      if (resumeId !== userId)
        throw new UnauthorizedException('권한이 없습니다.');
      else throw new BadRequestException('존재하지 않는 항목입니다.');
    }
  }
}
