import { Component } from '@angular/core'

import { StorageService } from '../../services/storage/storage.service'
import { PantryEntry } from '../../../types/pantry-types'
import { Observable, BehaviorSubject, combineLatest } from 'rxjs'
import { ModalController } from '@ionic/angular'
import { AddPantryItemComponent } from '../add-pantry-item/add-pantry-item.component'

@Component({
	selector: 'app-pantry-list',
	templateUrl: './pantry-list.component.html',
	styleUrls: ['./pantry-list.component.scss'],
})
export class PantryListComponent {
	pantryItemsRaw$: Observable<PantryEntry[]>
	searchFilteredPantryItems: PantryEntry[]
	searchTerm$ = new BehaviorSubject(null)

	inputErrorMessage = ''

	constructor(public storage: StorageService, public modalController: ModalController) {}

	async ionViewDidEnter(): Promise<void> {
		await this.loadPantryList()
	}
	async loadPantryList(): Promise<void> {
		this.pantryItemsRaw$ = await this.storage.get_all(true, false)

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

	async openAddPantryItem(): Promise<void> {
		const modal = await this.modalController.create({
			component: AddPantryItemComponent,
			componentProps: {
				modalInstance: this.modalController,
			},
		})
		await modal.present()
		const retData = await modal.onDidDismiss()
		if (retData.data.added > 0) {
			await this.loadPantryList()
		}
	}

	searchBoxChange(event: KeyboardEvent): void {
		const inputValue = (event.target as HTMLInputElement).value
		if (inputValue == '') {
			this.searchTerm$.next(null)
		} else {
			this.searchTerm$.next(inputValue)
		}
	}

	async deleteItem([key]: PantryEntry): Promise<void> {
		if (this.storage.get(key)) {
			this.storage.delete(key)
			await this.loadPantryList()
		}
	}

	async itemLow([key, pantryItem]: PantryEntry): Promise<void> {
		pantryItem.runningLow = true
		pantryItem.out = false
		await this.storage.update(key, pantryItem)
	}

	async itemGone([key, pantryItem]: PantryEntry): Promise<void> {
		pantryItem.runningLow = false
		pantryItem.out = true
		await this.storage.update(key, pantryItem)
	}

	async itemOk([key, pantryItem]: PantryEntry): Promise<void> {
		pantryItem.runningLow = false
		pantryItem.out = false
		await this.storage.update(key, pantryItem)
	}

	private getColor([, pantryItem]: PantryEntry): string {
		if (pantryItem.runningLow) {
			return 'warning'
		} else if (pantryItem.out) {
			return 'danger'
		}
		return 'light'
	}

	async exportDB(): Promise<void> {
		await this.storage.exportDBToFile()
	}

	recvFile(file: File): void {
		this.inputErrorMessage = ''
		if (!file.name.endsWith('.json')) {
			this.inputErrorMessage = "Doesn't look like a valid db file to me..."
			return
		}
		const fileReader = new FileReader()
		fileReader.onload = async () => {
			try {
				const contents = fileReader.result as string
				const parsedDB = JSON.parse(contents)
				await this.storage.overwriteDBWith(parsedDB)
				await this.loadPantryList()
			} catch (e) {
				this.inputErrorMessage = `Error parsing file ${e}`
			}
		}
		fileReader.readAsText(file)
	}
}
