import { MongoError } from 'mongodb'

const SECRETS = 'public_secrets'

export class PublicSecretRepository {
	dbHandler: Dependencies['dbHandler']
	publicParser: Dependencies['publicParser']
	uuid: Dependencies['muid']

	constructor({
		dbHandler,
		publicParser,
		muid,
	}: Pick<Dependencies, 'dbHandler' | 'publicParser' | 'muid'>) {
		this.dbHandler = dbHandler
		this.publicParser = publicParser
		this.uuid = muid
	}

	async save(secretDomain: PublicSecretDomain) {
		try {
			const db = await this.dbHandler.getInstance()
			const secretDocument = this.publicParser.toDocument(secretDomain)

			await db.collection<PublicSecretDocument>(SECRETS).insertOne(secretDocument)
		} catch (error: unknown) {
			if (error instanceof MongoError) {
				throw error
			}
			throw error
		}
	}

	async get(limit: number, lastDate?: Date) {
		try {
			const db = await this.dbHandler.getInstance()
			const query = lastDate instanceof Date ? { created_at: { $lt: lastDate } } : {}

			const documents = await db
				.collection<PublicSecretDocument>(SECRETS)
				.find(query)
				.sort({ created_at: -1 })
				.limit(limit)
				.toArray()

			return documents.map((d) => this.publicParser.toDomain(d))
		} catch (error) {
			if (error instanceof Error) {
				throw error
			}
			throw error
		}
	}
}
