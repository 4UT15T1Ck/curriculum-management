import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DecisionRemarkDto, OverrideDecisionDto } from './decision.dto.js';

const errors = (cls: new () => object, plain: object) =>
  validate(plainToInstance(cls, plain));

describe('decision DTOs', () => {
  const twenty = 'x'.repeat(20);

  it('counts the remark after trimming (BR-28, KB-047)', async () => {
    expect(
      await errors(DecisionRemarkDto, { remark: 'x'.repeat(19) }),
    ).not.toHaveLength(0);
    expect(
      await errors(DecisionRemarkDto, { remark: ' '.repeat(30) }),
    ).not.toHaveLength(0);
    expect(
      await errors(DecisionRemarkDto, { remark: `  ${twenty}  ` }),
    ).toHaveLength(0);
  });

  it('requires a 20-character reason and a known action for an override (US-070 AC2)', async () => {
    expect(
      await errors(OverrideDecisionDto, {
        action: 'APPROVE',
        reason: 'x'.repeat(19),
      }),
    ).not.toHaveLength(0);
    expect(
      await errors(OverrideDecisionDto, { action: 'PENDING', reason: twenty }),
    ).not.toHaveLength(0);
    expect(
      await errors(OverrideDecisionDto, { action: 'RETURN', reason: twenty }),
    ).toHaveLength(0);
  });
});
