import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Answers questions about a version's curriculum for features that must not import the curriculum feature.
@Injectable()
export class CurriculumFactsReader {
  constructor(private readonly prisma: PrismaService) {}

  // The last semester that holds a row, or null when the curriculum is empty (EC-08).
  async maxPlannedSemester(versionId: string): Promise<number | null> {
    const result = await this.prisma.curriculumItem.aggregate({
      where: { versionId },
      _max: { plannedSemester: true },
    });
    return result._max.plannedSemester;
  }
}
