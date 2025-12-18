import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [MailController],
  providers: [MailService],
  imports : [TypeOrmModule.forFeature([User])],
  exports: [MailService],
})
export class MailModule {}
