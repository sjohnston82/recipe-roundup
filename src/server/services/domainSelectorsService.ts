import {
  findDomainSelector,
  upsertDomainSelectors,
} from "../repositories/domainSelectorRepo";

export async function getCustomSelectorsForDomain(domain: string) {
  const ds = await findDomainSelector(domain);
  if (!ds) return null;
  return {
    title: ds.titleSelector ? [ds.titleSelector] : undefined,
    description: ds.descriptionSelector ? [ds.descriptionSelector] : undefined,
    ingredients: ds.ingredientsSelector ? [ds.ingredientsSelector] : undefined,
    instructions: ds.instructionsSelector
      ? [ds.instructionsSelector]
      : undefined,
    prepTime: ds.prepTimeSelector ? [ds.prepTimeSelector] : undefined,
    cookTime: ds.cookTimeSelector ? [ds.cookTimeSelector] : undefined,
    servings: ds.servingsSelector ? [ds.servingsSelector] : undefined,
    image: ds.imageSelector ? [ds.imageSelector] : undefined,
    cuisine: ds.cuisineSelector ? [ds.cuisineSelector] : undefined,
  } as const;
}

export async function saveSuccessfulSelectors(
  domain: string,
  selectors: Record<string, string>
) {
  if (Object.keys(selectors).length === 0) return null;
  return upsertDomainSelectors(domain, selectors);
}

