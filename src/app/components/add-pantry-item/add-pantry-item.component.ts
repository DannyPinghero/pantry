import { Component, Input } from '@angular/core'
import { StorageService } from '../../services/storage/storage.service'
import { ModalController } from '@ionic/angular'

@Component({
	selector: 'app-add-pantry-item',
	templateUrl: './add-pantry-item.component.html',
	styleUrls: ['./add-pantry-item.component.scss'],
})
export class AddPantryItemComponent {
	constructor(public storage: StorageService) {}
	newItemName: string = null
	adding = false
	added = 0
	@Input() modalInstance: ModalController

	closeModal() {
		this.modalInstance.dismiss({
			added: this.added,
		})
	}

	addElement() {
		this.adding = true
		const slug = this.storage.get_slug(this.newItemName)
		this.storage.set(slug, {
			name: this.newItemName,
			created: new Date(),
			modified: new Date(),
		})
		this.adding = false
		this.newItemName = ''
		this.added += 1
	}
}
