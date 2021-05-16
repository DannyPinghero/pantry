import { Injectable } from '@angular/core'
import { Storage } from '@ionic/storage-angular'
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver'

import { PantryItem, PantryEntry, AdHocShoppingItem, AdHocShoppingEntry } from '../../../types/pantry-types'
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
			return
		}
		await this.storage.defineDriver(CordovaSQLiteDriver)
		const storage = await this.storage.create()
		this._storage = storage
	}

	public async set(key: string, value: PantryItem | AdHocShoppingItem): Promise<void> {
		await this.init()
		const entryWithModified = { ...value, modified: new Date() }
		return this._storage?.set(key, entryWithModified)
	}

	public async get(key: string): Promise<PantryItem | AdHocShoppingItem> {
		await this.init()
		return await this._storage?.get(key)
	}

	public get_slug(name: string, adHoc = false): string {
		let slugName = slugify(name, { lower: true, strict: true })
		if (adHoc) {
			slugName = 'adhoc-' + slugName
		} else {
			slugName = 'pantry-' + slugName
		}
		return slugName
	}

	isAdHoc(key: string): boolean {
		return key.startsWith('adhoc-')
	}
	public async get_all(
		includePantry = true,
		includeAdHoc = true
	): Promise<Observable<(PantryEntry | AdHocShoppingEntry)[]>> {
		await this.init()
		const keys = await this._storage.keys()
		const pantryEntries = []
		const adHocEntries = []

		for (const key of keys) {
			const value = await this.get(key)
			if (this.isAdHoc(key)) {
				adHocEntries.push([key, value])
			} else {
				pantryEntries.push([key, value])
			}
		}

		let toReturn = []
		if (includePantry) {
			toReturn = toReturn.concat(pantryEntries)
		}
		if (includeAdHoc) {
			toReturn = toReturn.concat(adHocEntries)
		}
		return of(toReturn)
	}

	public async delete(key: string): Promise<void> {
		await this.init()
		await this._storage.remove(key)
	}

	public async update(key: string, partialObj: Partial<PantryItem | AdHocShoppingItem>): Promise<void> {
		const existing = (await this.get(key)) || null

		let newObj

		if (existing !== null) {
			newObj = { ...existing, ...partialObj }
		} else if (partialObj.name !== undefined) {
			newObj = partialObj
		} else {
			throw new Error(`Can not update ${key} - does not already exist and not enough info specified to create`)
		}

		await this.set(key, newObj)
	}
}
