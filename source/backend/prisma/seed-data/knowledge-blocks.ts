import type { PrismaClient } from '../../src/generated/prisma/client.js';

// Codes and names come from the Khoa's curriculum workbook (Q-08, F07-02). The workbook has not been supplied yet,
// so the list is empty: the symbol on a curriculum row is free text and the block filter then shows the raw symbols.
// Adding a block here (and re-running the seed) gives the symbol a name and the AutoComplete a suggestion.
export const SEED_KNOWLEDGE_BLOCKS: readonly {
  blockCode: string;
  blockName: string;
  requiredCredits: string | null;
}[] = [];

export async function seedKnowledgeBlocks(prisma: PrismaClient): Promise<void> {
  for (const block of SEED_KNOWLEDGE_BLOCKS) {
    await prisma.knowledgeBlock.upsert({
      where: { blockCode: block.blockCode },
      update: block,
      create: block,
    });
  }
}
