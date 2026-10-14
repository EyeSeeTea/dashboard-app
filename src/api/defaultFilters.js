import { apiReadDataStoreValue } from './dataStore.js'

const KEY_DEFAULT_FILTERS = 'defaultFilters'
const DEFAULT_VALUE_DEFAULT_FILTERS = {}
const configurationByEngine = new WeakMap()

// Cache optional configuration for the app session, including failed reads.
export const apiGetDefaultFilters = (dataEngine) => {
    if (!configurationByEngine.has(dataEngine)) {
        configurationByEngine.set(
            dataEngine,
            apiReadDataStoreValue(KEY_DEFAULT_FILTERS, dataEngine).catch(
                () => DEFAULT_VALUE_DEFAULT_FILTERS
            )
        )
    }
    return configurationByEngine.get(dataEngine)
}
