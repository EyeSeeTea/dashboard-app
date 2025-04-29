import i18n from '@dhis2/d2-i18n'
import { generateUid } from 'd2/uid'
import {
    NEW_FILTER_ID,
    savedFilterUserPermission,
    privateVisibility,
    publicVisibility,
} from '../modules/savedFilters.js'
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
        [privateVisibility]: privateFilters,
        [publicVisibility]: publicFilters,
    }))

export const apiSaveFilter = async (filter, currentUser) => {
    const permissions = savedFilterUserPermission({ filter, currentUser })
    const actionAllowed =
        filter.id === NEW_FILTER_ID ? permissions.create : permissions.edit
    if (!actionAllowed) {
        return Promise.reject({ error: 'User not allowed to save this filter' })
    }

    const [get, save] = getDataStoreFn(filter.visibility)
    const savedFilters = await get(KEY_SAVED_FILTERS, [])

    const { isValid, message } = validateFilterName(filter, savedFilters)
    if (!isValid) {
        return Promise.reject({ error: message, refetch: true })
    }

    const { filter: updatedFilter, savedFilters: updatedFilters } =
        upsertOrInsertFilter(filter, savedFilters, currentUser)

    await save(KEY_SAVED_FILTERS, updatedFilters)
    return updatedFilter
}

export const apiDeleteFilter = async (filter, currentUser) => {
    const permissions = savedFilterUserPermission({ filter, currentUser })
    if (!permissions.delete) {
        return Promise.reject({
            error: i18n.t('User not allowed to delete this filter'),
        })
    }

    const [get, save] = getDataStoreFn(filter.visibility)
    const savedFilters = await get(KEY_SAVED_FILTERS, [])
    const existingFilter = savedFilters.find((f) => f.id === filter.id)

    if (!existingFilter) {
        return true
    }

    const payload = savedFilters.filter((f) => f.id !== filter.id)

    await save(KEY_SAVED_FILTERS, payload)
    return true
}

export const validateFilterName = (filter, savedFilters) => {
    const existingFilter = savedFilters.find((f) => f.id === filter.id)

    if (
        savedFilters.length > 0 &&
        (filter.id === NEW_FILTER_ID ||
            !existingFilter ||
            filter.name !== existingFilter.name)
    ) {
        const isValid = savedFilters.every(
            (savedFilter) =>
                !(
                    savedFilter.name === filter.name &&
                    savedFilter.dashboardId === filter.dashboardId
                )
        )
        return {
            isValid,
            message: isValid
                ? null
                : i18n.t(
                      'A filter with this name already exists as {{ visibility }}.  Please choose a different name.',
                      { visibility: filter.visibility }
                  ),
        }
    }

    return {
        isValid: true,
    }
}

const getDataStoreFn = (visibility) => {
    return visibility === privateVisibility
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
    filter.id && filter.id !== NEW_FILTER_ID
        ? upsertFilter(filter, savedFilters, currentUser)
        : insertNewFilter(filter, savedFilters, currentUser)
