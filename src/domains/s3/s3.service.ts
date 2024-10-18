import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get('AWS_REGION');
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    this.s3 = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
    this.bucketName =
      this.configService.get('AWS_S3_BUCKET_NAME') ?? 'criends-bucket';
  }

  async uploadFile(file: Express.Multer.File) {
    if (file === undefined) return undefined;

    const body = file.buffer;
    const contentType = file.originalname.split('.').pop()?.toLowerCase();
    const key = `${nanoid()}.${contentType}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    const awsRegion = this.configService.get('AWS_REGION');

    await this.s3.send(uploadCommand);

    return `https://${this.bucketName}.s3.${awsRegion}.amazonaws.com/${key}`;
  }
}
