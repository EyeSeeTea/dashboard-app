import { generateUid } from 'd2/uid'
import { privateVisiblity, publicVisibility } from '../reducers/savedFilters.js'
import { apiGetDataStoreValue, apiPostDataStoreValue } from './dataStore.js'
import {
    apiGetUserDataStoreValue,
    apiPostUserDataStoreValue,
} from './userDataStore.js'

const KEY_SAVED_FILTERS = 'savedFilters'
const DEFAULT_VALUE_SAVED_FILTERS = []

export const apiGetSavedFilters = async () =>
    Promise.all([
        apiGetUserDataStoreValue(
            KEY_SAVED_FILTERS,
            DEFAULT_VALUE_SAVED_FILTERS
        ),
        apiGetDataStoreValue(KEY_SAVED_FILTERS, DEFAULT_VALUE_SAVED_FILTERS),
    ]).then(([privateFilters, publicFilters]) => ({
        [privateVisiblity]: privateFilters,
        [publicVisibility]: publicFilters,
    }))

export const apiSaveFilter = async (filter, currentUser) => {
    const [get, save] = getDataStoreFn(filter.visibility)
    const savedFilters = await get(KEY_SAVED_FILTERS, [])

    const { filter: updatedFilter, savedFilters: updatedFilters } =
        upsertOrInsertFilter(filter, savedFilters, currentUser)

    if (!isFilterActionAllowed(updatedFilter, currentUser)) {
        return Promise.reject('User not allowed to save this filter')
    }

    await save(KEY_SAVED_FILTERS, updatedFilters)
    return updatedFilter
}

export const apiDeleteFilter = async (filter, currentUser) => {
    const [get, save] = getDataStoreFn(filter.visibility)
    const savedFilters = await get(KEY_SAVED_FILTERS, [])
    const existingFilter = savedFilters.find((f) => f.id === filter.id)

    if (!existingFilter) {
        return true
    }
    if (!isFilterActionAllowed(existingFilter, currentUser)) {
        return Promise.reject('User not allowed to save this filter')
    }
    const payload = savedFilters.filter((f) => f.id !== filter.id)

    await save(KEY_SAVED_FILTERS, payload)
    return true
}

export const isFilterActionAllowed = (filter, currentUser) => {
    return (
        currentUser.authorities?.includes('Saved Filters Admin') ||
        filter.userId === currentUser.id
    )
}

const getDataStoreFn = (visibility) => {
    return visibility === privateVisiblity
        ? [apiGetUserDataStoreValue, apiPostUserDataStoreValue]
        : [apiGetDataStoreValue, apiPostDataStoreValue]
}

const insertNewFilter = (filter, savedFilters, currentUser) => {
    const newFilter = {
        ...filter,
        id: generateUid(),
        userId: filter.userId || currentUser.id,
        userName: filter.userName || currentUser.username,
    }
    return {
        filter: newFilter,
        savedFilters: [...savedFilters, newFilter],
    }
}

const upsertFilter = (filter, savedFilters, currentUser) => {
    const index = savedFilters.findIndex((f) => f.id === filter.id)

    if (index !== -1) {
        const updatedFilter = { ...savedFilters[index], ...filter }
        return {
            filter: updatedFilter,
            savedFilters: [
                ...savedFilters.slice(0, index),
                updatedFilter,
                ...savedFilters.slice(index + 1),
            ],
        }
    } else {
        return insertNewFilter(filter, savedFilters, currentUser)
    }
}

const upsertOrInsertFilter = (filter, savedFilters, currentUser) =>
    filter.id
        ? upsertFilter(filter, savedFilters, currentUser)
        : insertNewFilter(filter, savedFilters, currentUser)
