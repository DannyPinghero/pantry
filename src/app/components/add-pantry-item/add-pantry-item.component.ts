import { Component, Input, ViewChild } from '@angular/core'
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
	errorMessage = ''
	@Input() modalInstance: ModalController
	@ViewChild('pantryInput') myInput;

	ionViewDidEnter(): void {
		setTimeout(() => {
			this.myInput.setFocus()
		}, 150)
	}

	closeModal(): void {
		this.modalInstance.dismiss({
			added: this.added,
		})
	}

	async addElement(): Promise<void> {
		this.adding = true
		const slug = this.storage.get_slug(this.newItemName)
		const itemExists = await this.storage.get(slug)
		if (itemExists) {
			this.adding = false
			this.errorMessage = `You already have ${this.newItemName} in your pantry`
			this.newItemName = ''
			this.myInput.setFocus()
			return
		}
		await this.storage.set(slug, {
			name: this.newItemName,
			created: new Date(),
			modified: new Date(),
		})
		this.adding = false
		this.newItemName = ''
		this.errorMessage = ''
		this.added += 1
		this.myInput.setFocus()
	}
}
