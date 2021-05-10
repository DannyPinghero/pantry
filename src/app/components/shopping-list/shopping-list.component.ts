import { Component, OnInit } from '@angular/core'
import { PantryItem, PantryEntry } from '../../../types/pantry-types'
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
	inCart: (PantryEntry | AdHocShoppingItem)[]

	pantryList$: Observable<PantryEntry>

	constructor(public storage: StorageService) {}

	async loadPantryList() {
		this.pantryList$ = await this.storage.get_all()

		this.runningLow = 
	}

	async ngOnInit() {}
}
