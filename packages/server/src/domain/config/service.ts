import type { Config } from "./entity";
import type { IConfigRepository } from "./repository";

export async function findFirst(
	repo: IConfigRepository,
): Promise<Config | undefined> {
	return await repo.findFirst();
}

export async function upsert(
	repo: IConfigRepository,
	entity: Config,
): Promise<Config> {
	return await repo.upsert(entity);
}
