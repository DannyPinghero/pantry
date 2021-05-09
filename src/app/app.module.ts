import { NgModule } from '@angular/core'

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

@NgModule({
	declarations: [AppComponent, MainTabBarComponent, PantryListComponent, ShoppingListComponent],
	entryComponents: [],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
		IonicStorageModule.forRoot({ driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB] }),
	],
	providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, StorageService],
	bootstrap: [AppComponent],
})
export class AppModule {}
