import { Component, OnInit } from '@angular/core'

import { StorageService } from '../../services/storage/storage.service'

@Component({
	selector: 'app-pantry-list',
	templateUrl: './pantry-list.component.html',
	styleUrls: ['./pantry-list.component.scss'],
})
export class PantryListComponent implements OnInit {
	storage: StorageService

	constructor(storage: StorageService) {
		this.storage = storage
	}

	async ngOnInit() {
		console.log('pantry list init')
		const exampleItem = 'Bread Flour 2'
		const exampleItemSlug = this.storage.get_slug(exampleItem)
		const storedItem = await this.storage.get(exampleItemSlug)
		console.log(storedItem)
		if (storedItem == null) {
			const ret = await this.storage.set(exampleItemSlug, {
				name: exampleItem,
			})
			console.log(ret)
		}
	}
}
