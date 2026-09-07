import every from 'lodash/every.js'
import isEqual from 'lodash/isEqual.js'
import keyBy from 'lodash/keyBy.js'
import mapValues from 'lodash/mapValues.js'
import some from 'lodash/some.js'
import sortBy from 'lodash/sortBy.js'
import {
    apiDeleteFilter,
    apiGetSavedFilters,
    apiSaveFilter,
} from '../api/savedFilters.js'
import {
    NEW_FILTER_ID,
    privateVisibility,
    publicVisibility,
} from '../modules/savedFilters.js'
import {
    buildSavedFilters,
    SET_ACTIVE_FILTER,
    SET_LOADING_SAVED_FILTERS,
    SET_SAVED_FILTERS,
    sGetActiveFilter,
    sGetSavedFiltersList,
} from '../reducers/savedFilters.js'
import { sGetSelectedId } from '../reducers/selected.js'
import {
    acClearItemFilters,
    acSetItemFilters,
    FILTER_ORG_UNIT,
} from './itemFilters.js'

const isFilterAllowed = (orgUnitFilter, rootOrgUnits) => {
    if (!orgUnitFilter) {
        return true
    }
    return every(orgUnitFilter.values, ({ path }) =>
        some(rootOrgUnits, ({ id }) => !path || path.includes(id))
    )
}

const doFetchAndSelect = (updatedFilter) => async (dispatch) => {
    await dispatch(tFetchSavedFilters())
    dispatch(acSetActiveFilter(updatedFilter))
}

const handleError = (error, fnName) => async (dispatch) => {
    const message = error.message || error.error || error
    console.log(`Error (${fnName}): ${message}`)

    if (error.refetch) {
        await dispatch(tFetchSavedFilters())
    }
}
// actions

export const acSetFilters = (filters) => ({
    type: SET_SAVED_FILTERS,
    filters,
})

export const acSetActiveFilter = (filter) => ({
    type: SET_ACTIVE_FILTER,
    filter,
})

export const acSetLoadingSavedFilters = (loading) => ({
    type: SET_LOADING_SAVED_FILTERS,
    loading,
})

// thunks

export const tSelectSavedFilter =
    ({ filterId, rootOrgUnits } = {}) =>
    (dispatch, getState) => {
        if (!filterId) {
            dispatch(acClearItemFilters())
            dispatch(acSetActiveFilter(null))
            return true
        }

        const savedFilters = sGetSavedFiltersList(getState())
        const appliedFilters = buildSavedFilters(getState())
        const filter = savedFilters.find(({ id }) => id === filterId) || {}

        if (isEqual(filter.values, appliedFilters)) {
            dispatch(acSetActiveFilter(filter))
            return true
        }

        const orgUnitFilter = filter.values.find(
            ({ id }) => id === FILTER_ORG_UNIT
        )

        if (!isFilterAllowed(orgUnitFilter, rootOrgUnits)) {
            return false
        }

        const filters = mapValues(keyBy(filter.values, 'id'), 'values')

        dispatch(acSetItemFilters(filters))
        dispatch(acSetActiveFilter(filter))

        return true
    }

export const tFetchSavedFilters =
    () => async (dispatch, _getState, dataEngine) => {
        const filters = await apiGetSavedFilters(dataEngine)

        return dispatch(
            acSetFilters({
                [privateVisibility]: sortBy(filters.private, 'name'),
                [publicVisibility]: sortBy(filters.public, 'name'),
            })
        )
    }

export const tSaveFilter =
    (currentUser, filter) => async (dispatch, getState, dataEngine) => {
        const dashboardId = sGetSelectedId(getState())

        try {
            const filterUpdate = {
                ...filter,
                dashboardId,
                values: buildSavedFilters(getState()),
            }

            const updatedFilter = await apiSaveFilter(
                filterUpdate,
                currentUser,
                dataEngine
            )
            await dispatch(doFetchAndSelect(updatedFilter))
            return true
        } catch (error) {
            dispatch(handleError(error, 'tSaveFilter'))
            return false
        }
    }

export const tDeleteActiveFilter =
    (currentUser) => async (dispatch, getState, dataEngine) => {
        try {
            const filter = sGetActiveFilter(getState())
            await apiDeleteFilter(filter, currentUser, dataEngine)
            await dispatch(tFetchSavedFilters())
            dispatch(tSelectSavedFilter())
            return true
        } catch (error) {
            dispatch(handleError(error, 'tDeleteActiveFilter'))
            return false
        }
    }

export const tToggleActiveFilterVisibility =
    (currentUser) => async (dispatch, getState, dataEngine) => {
        try {
            const filter = { ...sGetActiveFilter(getState()) }

            const newVisibility =
                filter.visibility === privateVisibility
                    ? publicVisibility
                    : privateVisibility

            const filterUpdate = {
                ...filter,
                id: NEW_FILTER_ID,
                visibility: newVisibility,
                values: buildSavedFilters(getState()),
            }

            // Currently, only save error that can occur during toggle is duplicate name error
            let updatedFilter
            try {
                updatedFilter = await apiSaveFilter(
                    filterUpdate,
                    currentUser,
                    dataEngine
                )
            } catch (error) {
                error.type = 'save'
                throw error
            }

            try {
                await apiDeleteFilter(filter, currentUser, dataEngine)
            } catch (error) {
                error.type = 'delete'
                throw error
            }

            await dispatch(doFetchAndSelect(updatedFilter))

            return true
        } catch (error) {
            dispatch(handleError(error, 'tToggleActiveFilterVisibility'))
            throw error
        }
    }
