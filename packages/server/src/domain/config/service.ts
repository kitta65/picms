import type { Config } from "./entity";
import type { IConfigRepository } from "./repository";

export async function upsert(repo: IConfigRepository, entity: Config) {
	await repo.upsert(entity);
}
