import { Component, OnInit } from '@angular/core'

import { StorageService } from '../../services/storage/storage.service'
import { PantryItem } from '../../../types/pantry-types'
import { Observable, BehaviorSubject, combineLatest } from 'rxjs'
import { ModalController } from '@ionic/angular'
import { AddPantryItemComponent } from '../add-pantry-item/add-pantry-item.component'
@Component({
	selector: 'app-pantry-list',
	templateUrl: './pantry-list.component.html',
	styleUrls: ['./pantry-list.component.scss'],
})
export class PantryListComponent implements OnInit {
	pantryItemsRaw$: Observable<[string, PantryItem][]>
	searchFilteredPantryItems: [string, PantryItem][]
	searchTerm$ = new BehaviorSubject(null)

	constructor(public storage: StorageService, public modalController: ModalController) {}

	async loadPantryList() {
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
		await this.loadPantryList()
	}

	async openAddPantryItem(): Promise<void> {
		const modal = await this.modalController.create({
			component: AddPantryItemComponent,
			componentProps: {
				modalInstance: this.modalController,
			},
		})
		await modal.present()
		const retData = await modal.onDidDismiss()
		console.log('Add New Item Clicked', retData)
		if (retData.data.added > 0) {
			await this.loadPantryList()
		}
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
