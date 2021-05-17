export interface PantryItem {
	name: string
	modified?: Date
	runningLow?: boolean
	out?: boolean
	inCart?: boolean
}

export interface AdHocShoppingItem {
	name: string
	modified?: Date
	inCart?: boolean
}

export type PantryEntry = [string, PantryItem]
export type AdHocShoppingEntry = [string, AdHocShoppingItem]

// the strings in these types are the slug name / keys
