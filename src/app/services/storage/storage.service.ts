import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage-angular'
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver'

import { PantryItem } from '../../../types/pantry-types'
import slugify from '../../../../node_modules/slugify/slugify'
import { of, Observable } from 'rxjs'

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
		await this.storage.defineDriver(CordovaSQLiteDriver)
		const storage = await this.storage.create()
		this._storage = storage
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

	public async get_all(): Promise<Observable<[string, PantryItem][]>> {
		const keys = await this._storage.keys()
		const items = []
		for (const key of keys) {
			const value = await this.get(key)
			items.push([key, value])
		}
		return of(items)
	}
}
