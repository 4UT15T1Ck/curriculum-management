import { OrgUnitType } from '../../src/generated/prisma/client.js';

export const ORG_UNIT_CODES = {
  UNIVERSITY: 'DHBK',
  FACULTY_IT: 'KHOA_CNTT',
  ACADEMIC_OFFICE: 'PDT',
} as const;

export const SEED_ORG_UNITS = [
  {
    unitCode: ORG_UNIT_CODES.UNIVERSITY,
    unitName: 'Trường Đại học Bách khoa – Đại học Đà Nẵng',
    unitType: OrgUnitType.UNIVERSITY,
    parentCode: null,
  },
  {
    unitCode: ORG_UNIT_CODES.FACULTY_IT,
    unitName: 'Khoa Công nghệ Thông tin',
    unitType: OrgUnitType.FACULTY,
    parentCode: ORG_UNIT_CODES.UNIVERSITY,
  },
  {
    unitCode: ORG_UNIT_CODES.ACADEMIC_OFFICE,
    unitName: 'Phòng Đào tạo',
    unitType: OrgUnitType.OFFICE,
    parentCode: ORG_UNIT_CODES.UNIVERSITY,
  },
] as const;
