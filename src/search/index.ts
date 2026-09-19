import FlexSearch from "flexsearch";
import { getSearchableEntities, type SearchableEntity } from "../data";

let searchIndex = new FlexSearch.Index({
  tokenize: "forward",
});

let searchableEntities = new Map<string, SearchableEntity>();

export async function rebuildSearchIndex(): Promise<void> {
  const entities = await getSearchableEntities();
  const nextIndex = new FlexSearch.Index({
    tokenize: "forward",
  });
  const nextEntities = new Map<string, SearchableEntity>();

  for (const entity of entities) {
    nextEntities.set(entity.id, entity);
    nextIndex.add(entity.id, [entity.title, entity.text, ...entity.tags].join(" "));
  }

  searchIndex.clear();
  searchIndex = nextIndex;
  searchableEntities = nextEntities;
}

export function searchEntities(query: string): SearchableEntity[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  return searchIndex
    .search(normalizedQuery, { limit: 60 })
    .map((id) => searchableEntities.get(String(id)))
    .filter((entity): entity is SearchableEntity => Boolean(entity))
    .sort((first, second) => first.type.localeCompare(second.type) || first.title.localeCompare(second.title));
}
