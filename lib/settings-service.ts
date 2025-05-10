import { prisma } from './prisma';
import { SETTING_CLOSED, SETTING_FALSE, SETTING_TRUE } from './constants';

export async function isJudgingClosed() {
  const setting = await prisma.setting.findUnique({
    where: { key: SETTING_CLOSED }
  });
  
  return setting?.value === SETTING_TRUE;
}

export async function setJudgingClosed(closed: boolean) {
  const value = closed ? SETTING_TRUE : SETTING_FALSE;
  
  return await prisma.setting.upsert({
    where: { key: SETTING_CLOSED },
    update: { value },
    create: { key: SETTING_CLOSED, value }
  });
}

export async function getSetting(key: string) {
  return await prisma.setting.findUnique({
    where: { key }
  });
}

export async function setSetting(key: string, value: string) {
  return await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}

export async function getAllSettings() {
  return await prisma.setting.findMany();
} 