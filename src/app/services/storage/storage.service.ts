import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage-angular'
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver'

import { PantryItem } from '../../../types/pantry-types'
import slugify from '../../../../node_modules/slugify/slugify'

// https://github.com/ionic-team/ionic-storage

@Injectable({
	providedIn: 'root',
})
export class StorageService {
	private _storage: Storage | null = null

	constructor(private storage: Storage) {}

	async init(): Promise<void> {
		if (this._storage != null) {
			console.log('storage already initted!')
			return
		}
		console.log('storage init')
		await this.storage.defineDriver(CordovaSQLiteDriver)
		const storage = await this.storage.create()
		this._storage = storage
		console.log(this._storage)
	}

	public async set(key: string, value: PantryItem): Promise<void> {
		await this.init()
		return this._storage?.set(key, value)
	}

	public async get(key: string): Promise<PantryItem> {
		await this.init()
		return await this._storage?.get(key)
	}

	public get_slug(name: string): string {
		return slugify(name, { lower: true, strict: true })
	}
}
