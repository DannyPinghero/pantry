import { Component } from '@angular/core'
import { PantryEntry, AdHocShoppingEntry, PantryItem, AdHocShoppingItem } from '../../../types/pantry-types'
import { StorageService } from '../../services/storage/storage.service'
import { Observable } from 'rxjs'

@Component({
	selector: 'app-shopping-list',
	templateUrl: './shopping-list.component.html',
	styleUrls: ['./shopping-list.component.scss'],
})
export class ShoppingListComponent {
	runningLow: PantryEntry[]
	outOf: PantryEntry[]
	inCart: (PantryEntry | AdHocShoppingEntry)[] = []
	adHocItems: AdHocShoppingEntry[] = []

	pantryList$: Observable<PantryEntry[]>

	inCartCheckedStatusByKey: Record<string, boolean> = {}

	constructor(public storage: StorageService) {}

	async loadPantryList(): Promise<void> {
		this.pantryList$ = await this.storage.get_all(true, false)
		const adHoc = await this.storage.get_all(false, true)
		adHoc.subscribe(adHocEntryList => {
			this.inCart = adHocEntryList
		})

		this.pantryList$.subscribe(pantryList => {
			this.runningLow = pantryList.filter(([, pantryItem]) => pantryItem.runningLow && !pantryItem.inCart)
			this.outOf = pantryList.filter(([, pantryItem]) => pantryItem.out && !pantryItem.inCart)
			this.inCart = this.inCart.concat(pantryList.filter(([, pantryItem]) => pantryItem.inCart))
		})
		this.inCart.forEach(([key]) => {
			this.inCartCheckedStatusByKey[key] = true
		})
	}

	async ionViewDidEnter(): Promise<void> {
		await this.loadPantryList()
	}

	async placeInCart([key, item]: PantryEntry | AdHocShoppingEntry): Promise<void> {
		this.runningLow = this.runningLow.filter(([key_]) => key_ !== key)
		this.outOf = this.outOf.filter(([key_]) => key_ !== key)
		this.inCart.push([key, item])
		item.inCart = true
		this.inCartCheckedStatusByKey[key] = true
		await this.storage.update(key, item)
	}

	async uncheckCartItem([key, item]: PantryEntry | AdHocShoppingEntry): Promise<void> {
		this.inCartCheckedStatusByKey[key] = false
		item.inCart = false

		if (this.storage.isAdHoc(key)) {
			this.adHocItems.push([key, item])
		} else {
			if ((item as PantryItem).runningLow) {
				this.runningLow.push([key, item])
			} else {
				this.outOf.push([key, item])
			}
			item.inCart = false
		}
		this.inCart = this.inCart.filter(([key_]) => key_ != key)
		await this.storage.update(key, item)
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
