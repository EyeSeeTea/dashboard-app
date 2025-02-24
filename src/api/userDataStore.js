import { getInstance } from 'd2'
import {
    apiGetGenericDataStoreValue,
    apiPostGenericDataStoreValue,
} from './dataStore.js'

export const apiPostUserDataStoreValue = async (key, value) => {
    const d2 = await getInstance()
    return apiPostGenericDataStoreValue(key, value, d2.currentUser.dataStore)
}

export const apiGetUserDataStoreValue = async (key, defaultValue) => {
    const d2 = await getInstance()
    return apiGetGenericDataStoreValue(
        key,
        defaultValue,
        d2.currentUser.dataStore
    )
}
