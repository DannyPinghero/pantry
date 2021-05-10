export interface PantryItem {
	name: string
	created?: Date
	modified?: Date
	runningLow?: boolean
	out?: boolean
}

export type PantryEntry = [string, PantryItem]
