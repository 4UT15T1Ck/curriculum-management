import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MergeEquivalenceGroupsDto {
  @ApiProperty({
    description: 'Nhóm sẽ bị xóa; học phần của nó chuyển sang nhóm được giữ.',
  })
  @IsString()
  @IsNotEmpty()
  otherGroupId!: string;
}
