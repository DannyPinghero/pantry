import { Component, OnInit } from '@angular/core'
import { PantryEntry } from '../../../types/pantry-types'
import { StorageService } from '../../services/storage/storage.service'
import { Observable } from 'rxjs'

interface AdHocShoppingItem {
	name: string
	adhoc: true
}

@Component({
	selector: 'app-shopping-list',
	templateUrl: './shopping-list.component.html',
	styleUrls: ['./shopping-list.component.scss'],
})
export class ShoppingListComponent implements OnInit {
	runningLow: PantryEntry[]
	outOf: PantryEntry[]
	otherItems: AdHocShoppingItem[]
	inCart: (PantryEntry | AdHocShoppingItem)[] = []

	pantryList$: Observable<PantryEntry[]>

	constructor(public storage: StorageService) {}

	async loadPantryList(): Promise<void> {
		this.pantryList$ = await this.storage.get_all(true, false)
		const adHoc$ = await this.storage.get_all(false, true)
		const adHocList = await adHoc$.toPromise()
		this.inCart = adHocList

		const pantryList = await this.pantryList$.toPromise()
		this.runningLow = pantryList.filter(([, pantryItem]) => pantryItem.runningLow && !pantryItem.inCart)
		this.outOf = pantryList.filter(([, pantryItem]) => pantryItem.out && !pantryItem.inCart)
		this.inCart = this.inCart.concat(pantryList.filter(([, pantryItem]) => pantryItem.inCart))
	}

	async ngOnInit(): Promise<void> {
		await this.loadPantryList()
	}

	async ionViewDidEnter(): Promise<void> {
		await this.loadPantryList()
	}

	placeInCart(entry: PantryEntry): void {
		this.runningLow = this.runningLow.filter(([key]) => entry[0] !== key)
		this.outOf = this.outOf.filter(([key]) => entry[0] !== key)
		this.inCart.push(entry)
		entry[1].inCart = true
		this.storage.update(...entry)
	}
}
