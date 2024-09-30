import { PrismaService } from './../../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
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
        introduce: true,
        activity: true,
        certificate: true,
        career: true,
        site: true,
        additionalResume: true,
      },
    });

    if (!resume) throw new NotFoundException('이력서가 존재하지 않습니다.');

    return resume;
  }

  //다수 이력서 조회
  async getAllResumes(data: DGetAllResumes) {
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

    const resumes = await this.prismaService.resume.findMany({
      where: {
        expose: data.expose,
      },
      orderBy: orderByField,
    });

    return resumes;
  }

  async deleteItem(itemId: string) {
    if (itemId.startsWith('introduce')) this.deleteIntroduce(itemId);
    else if (itemId.startsWith('activity')) this.deleteActivity(itemId);
    else if (itemId.startsWith('certificate')) this.deleteCertificate(itemId);
    else if (itemId.startsWith('career')) this.deleteCareer(itemId);
    else if (itemId.startsWith('site')) this.deleteSite(itemId);
    else if (itemId.startsWith('additional'))
      this.deleteAdditionalResume(itemId);
  }

  // 이력서 개인정보 추가
  async editResumeInfo(dto: DResumeInfo, userId: string) {
    const existing = await this.prismaService.resumeInfo.findUnique({
      where: { id: userId },
    });

    return await this.prismaService.resumeInfo.update({
      where: { id: userId },
      data: {
        name: dto.name || existing.name,
        email: dto.email || existing.email,
        phone: dto.phone || existing.phone,
        address: dto.address || existing.address,
        profileImage: dto.profileImage || existing.profileImage,
      },
    });
  }

  // 이력서 자기소개 추가
  async editIntroduce(dto: DIntroduce[], userId: string) {
    const existing = await this.prismaService.introduce.findUnique({
      where: { id: userId },
    });

    return await Promise.all(
      dto.map((value: DIntroduce, index: number) =>
        this.prismaService.introduce.upsert({
          where: { id: 'introduce' + index.toString() + userId },
          create: {
            id: 'introduce' + index.toString() + userId,
            resumeId: userId,
            oneLine: value.oneLine,
            introduce: value.introduce,
          },
          update: {
            oneLine: value.oneLine || existing.oneLine,
            introduce: value.introduce || existing.introduce,
          },
        }),
      ),
    );
  }

  async deleteIntroduce(id: string) {
    const introduce = await this.prismaService.introduce.findFirst({
      where: { id: id },
    });

    if (!introduce) throw new NotFoundException('존재하지 않는 항목입니다.');

    await this.prismaService.introduce.delete({
      where: { id: id },
    });
  }

  // 이력서 활동 추가
  async editActivity(dto: DActivity[], userId: string) {
    const existing = await this.prismaService.activity.findUnique({
      where: { id: userId },
    });

    return await Promise.all(
      dto.map((value: DActivity, index: number) =>
        this.prismaService.activity.upsert({
          where: { id: 'activity' + index.toString() + userId },
          create: {
            id: 'activity' + index.toString() + userId,
            resumeId: userId,
            title: value.title,
            content: value.content,
            startDate: value.startDate,
            endDate: value.endDate,
          },
          update: {
            title: value.title || existing.title,
            content: value.content || existing.content,
            startDate: value.startDate || existing.startDate,
            endDate: value.endDate || existing.endDate,
          },
        }),
      ),
    );
  }

  // 이력서 활동 삭제
  async deleteActivity(id: string) {
    const activity = await this.prismaService.activity.findFirst({
      where: { id: id },
    });

    if (!activity) throw new NotFoundException('존재하지 않는 항목입니다.');

    await this.prismaService.activity.delete({
      where: { id: id },
    });
  }

  // 이력서 자격증 추가
  async editCertificate(dto: DCertificate[], userId: string) {
    const existing = await this.prismaService.certificate.findUnique({
      where: { id: userId },
    });

    await Promise.all(
      dto.map((value: DCertificate, index: number) =>
        this.prismaService.certificate.upsert({
          where: { id: 'certificate' + index.toString() + userId },
          create: {
            id: 'certificate' + index.toString() + userId,
            resumeId: userId,
            name: value.name,
            certificateDate: value.certificateDate,
            issuer: value.issuer,
            score: value.score,
            content: value.score,
          },
          update: {
            name: value.name || existing.name,
            certificateDate: value.certificateDate || existing.certificateDate,
            issuer: value.issuer || existing.issuer,
            score: value.score || existing.score,
            content: value.content || existing.content,
          },
        }),
      ),
    );
  }

  // 이력서 자격증 삭제
  async deleteCertificate(id: string) {
    const certificate = await this.prismaService.certificate.findFirst({
      where: { id: id },
    });

    if (!certificate) throw new NotFoundException('존재하지 않는 항목입니다.');

    await this.prismaService.certificate.delete({
      where: { id: id },
    });
  }

  // 이력서 경력 추가
  async editCareer(dto: DCareer[], userId: string) {
    const existing = await this.prismaService.career.findUnique({
      where: { id: userId },
    });

    await Promise.all(
      dto.map((value: DCareer, index: number) =>
        this.prismaService.career.upsert({
          where: { id: 'career' + index.toString() + userId },
          create: {
            id: 'career' + index.toString() + userId,
            resumeId: userId,
            company: value.company,
            position: value.position,
            content: value.content,
            startDate: value.startDate,
            endDate: value.endDate,
          },
          update: {
            company: value.company || existing.company,
            position: value.position || existing.position,
            content: value.content || existing.content,
            startDate: value.startDate || existing.startDate,
            endDate: value.endDate || existing.endDate,
          },
        }),
      ),
    );
  }

  // 이력서 경력 삭제
  async deleteCareer(id: string) {
    const career = await this.prismaService.career.findFirst({
      where: { id: id },
    });

    if (!career) throw new NotFoundException('존재하지 않는 항목입니다.');

    await this.prismaService.career.delete({
      where: { id: id },
    });
  }

  // 이력서 사이트 추가
  async editSite(dto: DSite[], userId: string) {
    const existing = await this.prismaService.site.findUnique({
      where: { id: userId },
    });

    await Promise.all(
      dto.map((value: DSite, index: number) =>
        this.prismaService.site.upsert({
          where: { id: 'site' + index.toString() + userId },
          create: {
            id: 'site' + index.toString() + userId,
            resumeId: userId,
            title: value.title,
            content: value.content,
            url: value.url,
          },
          update: {
            title: value.title || existing.title,
            content: value.content || existing.content,
            url: value.url || existing.url,
          },
        }),
      ),
    );
  }

  // 이력서 사이트 삭제
  async deleteSite(id: string) {
    const site = await this.prismaService.site.findFirst({
      where: { id: id },
    });

    if (!site) throw new NotFoundException('존재하지 않는 항목입니다.');

    await this.prismaService.site.delete({
      where: { id: id },
    });
  }

  // 이력서 추가사항 추가
  async editAdditionalResume(dto: DAdditionalResume[], userId: string) {
    const existing = await this.prismaService.site.findUnique({
      where: { id: userId },
    });

    await Promise.all(
      dto.map((value: DAdditionalResume, index: number) =>
        this.prismaService.additionalResume.upsert({
          where: { id: 'additional' + index.toString() + userId },
          create: {
            id: 'additional' + index.toString() + userId,
            resumeId: userId,
            title: value.title,
            content: value.content,
          },
          update: {
            title: value.title || existing.title,
            content: value.content || existing.content,
          },
        }),
      ),
    );
  }

  // 이력서 추가사항 삭제
  async deleteAdditionalResume(id: string) {
    const additionalResume =
      await this.prismaService.additionalResume.findFirst({
        where: { id: id },
      });

    if (!additionalResume)
      throw new NotFoundException('존재하지 않는 항목입니다.');

    await this.prismaService.additionalResume.delete({
      where: { id: id },
    });
  }
}
