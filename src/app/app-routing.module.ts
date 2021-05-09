import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

import { ShoppingListComponent } from './components/shopping-list/shopping-list.component'
import { PantryListComponent } from './components/pantry-list/pantry-list.component'
const routes: Routes = [
	{
		path: 'shopping-list',
		children: [{ path: '', component: ShoppingListComponent }],
	},
	{
		path: 'pantry-list',
		children: [{ path: '', component: PantryListComponent }],
	},
	{
		path: '',
		redirectTo: 'pantry-list',
		pathMatch: 'full',
	},
]

@NgModule({
	imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
	exports: [RouterModule],
})
export class AppRoutingModule {}
