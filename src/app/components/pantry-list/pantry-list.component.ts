import { Component, OnInit } from '@angular/core'

import { StorageService } from '../../services/storage/storage.service'
import { PantryItem } from '../../../types/pantry-types'
import { Observable, BehaviorSubject, combineLatest } from 'rxjs'
import { tap } from 'rxjs/operators'

@Component({
	selector: 'app-pantry-list',
	templateUrl: './pantry-list.component.html',
	styleUrls: ['./pantry-list.component.scss'],
})
export class PantryListComponent implements OnInit {
	storage: StorageService
	pantryItemsRaw$: Observable<[string, PantryItem][]>
	searchFilteredPantryItems: [string, PantryItem][]
	searchTerm$ = new BehaviorSubject(null)

	constructor(storage: StorageService) {
		this.storage = storage
	}

	async ngOnInit(): Promise<void> {
		// example obv
		const exampleItem = 'Bread Flour 2'
		const exampleItemSlug = this.storage.get_slug(exampleItem)
		const storedItem = await this.storage.get(exampleItemSlug)
		if (storedItem == null) {
			const ret = await this.storage.set(exampleItemSlug, {
				name: exampleItem,
			})
		}
		// end example

		this.pantryItemsRaw$ = await this.storage.get_all()

		combineLatest([this.pantryItemsRaw$, this.searchTerm$]).subscribe(([pantryEntries, searchTerm]) => {
			if (searchTerm === null) {
				this.searchFilteredPantryItems = pantryEntries
			} else {
				this.searchFilteredPantryItems = pantryEntries.filter(([, value]) => {
					const itemNameLower = value.name.toLowerCase()
					let match = false
					searchTerm.split(' ').forEach(st => {
						const lowerTerm = st.toLowerCase()
						if (itemNameLower.includes(lowerTerm)) {
							match = true
						}
					})
					return match
				})
			}
		})
	}

	openAddPantryItem(): void {
		console.log('Add New Item Clicked')
	}

	searchBoxChange(event): void {
		const inputValue = event.target.value
		if (inputValue == '') {
			this.searchTerm$.next(null)
		} else {
			this.searchTerm$.next(inputValue)
		}
	}
}
