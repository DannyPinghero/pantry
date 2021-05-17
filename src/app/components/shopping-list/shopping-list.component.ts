import { Component } from '@angular/core'
import { PantryEntry, AdHocShoppingEntry, PantryItem } from '../../../types/pantry-types'
import { StorageService } from '../../services/storage/storage.service'
import { Observable } from 'rxjs'

@Component({
	selector: 'app-shopping-list',
	templateUrl: './shopping-list.component.html',
	styleUrls: ['./shopping-list.component.scss'],
})
export class ShoppingListComponent {
	pantryList$: Observable<PantryEntry[]>

	outOf: PantryEntry[]
	runningLow: PantryEntry[]
	adHocItems: AdHocShoppingEntry[] = []
	inCart: (PantryEntry | AdHocShoppingEntry)[] = []

	inCartCheckedStatusByKey: Record<string, boolean> = {}

	constructor(public storage: StorageService) {}

	async ionViewDidEnter(): Promise<void> {
		await this.loadPantryList()
	}

	async loadPantryList(): Promise<void> {
		this.pantryList$ = await this.storage.get_all(true, false)
		const adHoc$ = await this.storage.get_all(false, true)

		const adHocEntryList = await adHoc$.toPromise()
		this.adHocItems = adHocEntryList.filter(([, item]: AdHocShoppingEntry) => !item.inCart)
		this.inCart = adHocEntryList.filter(([, item]: AdHocShoppingEntry) => item.inCart)

		const pantryList = await this.pantryList$.toPromise()
		this.outOf = pantryList.filter(([, pantryItem]) => pantryItem.out && !pantryItem.inCart)
		this.runningLow = pantryList.filter(([, pantryItem]) => pantryItem.runningLow && !pantryItem.inCart)
		this.inCart = this.inCart.concat(pantryList.filter(([, pantryItem]) => pantryItem.inCart))
		this.inCart.forEach(([key]) => {
			this.inCartCheckedStatusByKey[key] = true
		})
	}

	placeInList(entry: PantryEntry | AdHocShoppingEntry, listName: string): void {
		const allListNames = ['outOf', 'runningLow', 'adHocItems', 'inCart']
		const allListNamesButTarget = allListNames.filter(name => name != listName)
		this[listName].push(entry)
		for (const name of allListNamesButTarget) {
			this[name] = this[name].filter(([key]) => key != entry[0])
		}
	}
	async _toggleCartStatus([key, item]: AdHocShoppingEntry | PantryEntry, newState: boolean): Promise<void> {
		item.inCart = newState
		this.inCartCheckedStatusByKey[key] = newState
		await this.storage.update(key, item)
	}
	async placeInCart([key, item]: PantryEntry | AdHocShoppingEntry): Promise<void> {
		this.placeInList([key, item], 'inCart')
		await this._toggleCartStatus([key, item], true)
	}

	async uncheckCartItem([key, item]: PantryEntry | AdHocShoppingEntry): Promise<void> {
		let targetListName: string
		if (this.storage.isAdHoc(key)) {
			targetListName = 'adHocItems'
		} else {
			if ((item as PantryItem).runningLow) {
				targetListName = 'runningLow'
			} else {
				targetListName = 'outOf'
			}
		}
		this.placeInList([key, item], targetListName)
		this._toggleCartStatus([key, item], false)
	}

	async emptyCheckedItemsFromCart(): Promise<void> {
		for (const [key, item] of this.inCart.filter(([key]) => this.inCartCheckedStatusByKey[key])) {
			if (this.storage.isAdHoc(key)) {
				this.storage.delete(key)
			} else {
				;(item as PantryItem).runningLow = false
				;(item as PantryItem).out = false
				;(item as PantryItem).inCart = false
				this.storage.update(key, item)
			}
		}
		await this.loadPantryList()
	}
}
