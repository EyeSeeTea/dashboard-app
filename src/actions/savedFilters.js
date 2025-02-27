import _, { isEqual } from 'lodash'
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
    async (dispatch, getState) => {
        if (filterId) {
            const savedFilters = sGetSavedFiltersList(getState())
            const appliedFilters = sGetNamedItemFilters(getState())
            const filter = savedFilters.find((f) => f.id === filterId) || {}

            if (!isEqual(filter.values, appliedFilters)) {
                const orgUnitFilter = filter.values.find(
                    ({ id }) => id === FILTER_ORG_UNIT
                )
                const isFilterAllowed =
                    orgUnitFilter &&
                    _.every(orgUnitFilter.values, ({ path }) =>
                        _.some(rootOrgUnits, ({ id }) => path.includes(id))
                    )

                if (!isFilterAllowed) return false
                else {
                    const filters = _.mapValues(
                        _.keyBy(filter.values, 'id'),
                        'values'
                    )
                    await dispatch(acSetItemFilters(filters))
                }
            }

            await dispatch(acSetActiveFilter(filter))
        } else {
            await dispatch(acClearItemFilters())
            await dispatch(acSetActiveFilter(null))
        }
        return true
    }

export const tFetchSavedFilters = () => async (dispatch) => {
    const filters = await apiGetSavedFilters()
    return dispatch(acSetFilters(filters))
}

export const tSaveFilter =
    (currentUser, filter) => async (dispatch, getState) => {
        try {
            const { id, name, visibility } = filter

            const filterUpdate = {
                id,
                name,
                visibility,
                values: sGetNamedItemFilters(getState()),
            }

            const updatedFilter = await apiSaveFilter(filterUpdate, currentUser)
            await dispatch(tFetchSavedFilters())
            await dispatch(acSetActiveFilter(updatedFilter))
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
            await dispatch(tSelectSavedFilter())
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
