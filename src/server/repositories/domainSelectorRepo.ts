import { prisma } from "../db/prisma";

export async function findDomainSelector(domain: string) {
  return prisma.domainSelector.findUnique({ where: { domain } });
}

export async function upsertDomainSelectors(
  domain: string,
  selectors: Record<string, string>
) {
  return prisma.domainSelector.upsert({
    where: { domain },
    update: selectors,
    create: { domain, ...selectors },
  });
}

