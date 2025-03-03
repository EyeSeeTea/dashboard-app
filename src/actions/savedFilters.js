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
import { sGetNamedItemFilters } from '../reducers/itemFilters.js'
import {
    privateVisiblity,
    publicVisibility,
    SET_ACTIVE_FILTER,
    SET_LOADING_SAVED_FILTERS,
    SET_SAVED_FILTERS,
    sGetActiveFilter,
    sGetSavedFiltersList,
} from '../reducers/savedFilters.js'
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
        some(rootOrgUnits, ({ id }) => path.includes(id))
    )
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
        const appliedFilters = sGetNamedItemFilters(getState())
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

export const tFetchSavedFilters = () => async (dispatch) => {
    const filters = await apiGetSavedFilters()

    return dispatch(acSetFilters({
        [privateVisiblity]: sortBy(filters.private, 'name'),
        [publicVisibility]: sortBy(filters.public, 'name')
    }))
}

export const tSaveFilter =
    (currentUser, filter) => async (dispatch, getState) => {
        try {
            const filterUpdate = {
                ...filter,
                values: sGetNamedItemFilters(getState()),
            }

            const updatedFilter = await apiSaveFilter(filterUpdate, currentUser)
            await dispatch(tFetchSavedFilters())
            dispatch(acSetActiveFilter(updatedFilter))
            return true
        } catch (error) {
            console.log('Error (tSaveFilter): ', error)
            return false
        }
    }

export const tDeleteActiveFilter =
    (currentUser) => async (dispatch, getState) => {
        try {
            const filter = sGetActiveFilter(getState())
            await apiDeleteFilter(filter, currentUser)
            await dispatch(tFetchSavedFilters())
            dispatch(tSelectSavedFilter())
            return true
        } catch (error) {
            console.log('Error (tDeleteActiveFilter): ', error)
            return false
        }
    }

export const tToggleActiveFilterVisibility =
    (currentUser) => async (dispatch, getState) => {
        const filter = sGetActiveFilter(getState())

        await apiDeleteFilter(filter, currentUser)

        const newVisibility =
            filter.visibility === privateVisiblity
                ? publicVisibility
                : privateVisiblity
        const updatedFilter = { ...filter, visibility: newVisibility }

        return dispatch(tSaveFilter(currentUser, updatedFilter))
    }
