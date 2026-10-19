import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DiscontinueCourseDto {
  @ApiPropertyOptional({
    description:
      'Học phần thay thế; quan hệ Thay thế được tạo cùng lúc với việc ngừng mở lớp.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  replacementCourseId?: string;
}
