import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { RouteReuseStrategy } from '@angular/router'

import { IonicModule, IonicRouteStrategy } from '@ionic/angular'

import { IonicStorageModule } from '@ionic/storage-angular'
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver'
import { Drivers } from '@ionic/storage'

import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'
import { StorageService } from './services/storage/storage.service'
import { MainTabBarComponent } from './components/main-tab-bar/main-tab-bar.component'
import { PantryListComponent } from './components/pantry-list/pantry-list.component'
import { ShoppingListComponent } from './components/shopping-list/shopping-list.component'
import { AddPantryItemComponent } from './components/add-pantry-item/add-pantry-item.component'

@NgModule({
	declarations: [AppComponent, MainTabBarComponent, PantryListComponent, ShoppingListComponent, AddPantryItemComponent],
	entryComponents: [],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
		IonicStorageModule.forRoot({ driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB] }),
		FormsModule,
	],
	providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, StorageService],
	bootstrap: [AppComponent],
})
export class AppModule {}
