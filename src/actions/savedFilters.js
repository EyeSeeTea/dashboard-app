import { isEqual } from "lodash";
import {
    privateVisiblity,
    publicVisibility,
    SET_ACTIVE_FILTER,
    SET_SAVED_FILTERS,
    sGetActiveFilter,
    sGetSavedFiltersList,
} from '../reducers/savedFilters.js'
import {
    apiDeleteFilter,
    apiGetSavedFilters,
    apiSaveFilter,
} from '../api/savedFilters'
import { sGetNamedItemFilters } from '../reducers/itemFilters'
import { acAddItemFilter, acClearItemFilters } from './itemFilters'

// actions

export const acSetFilters = (filters) => ({
    type: SET_SAVED_FILTERS,
    value: filters,
})

export const acSetActiveFilter = (filter) => ({
    type: SET_ACTIVE_FILTER,
    value: filter,
})

// thunks

export const tSelectSavedFilter = (filterId) => async (dispatch, getState) => {
    if (filterId) {
        const savedFilters = sGetSavedFiltersList(getState())
        const appliedFilters = sGetNamedItemFilters(getState())
        const filter = savedFilters.find((f) => f.id === filterId) || {}

        if (!isEqual(filter.values, appliedFilters)) {
            await dispatch(acClearItemFilters())
            await Promise.all(
                filter.values.map(({ id, values: value }) =>
                    dispatch(acAddItemFilter({ id, value }))
                )
            )
        }

        await dispatch(acSetActiveFilter(filter))
    } else {
        await dispatch(acClearItemFilters())
        await dispatch(acSetActiveFilter(null))
    }
}

export const tFetchSavedFilters = () => async (dispatch) => {
    const filters = await apiGetSavedFilters()
    return dispatch(acSetFilters(filters))
}

export const tSaveFilter =
    (currentUser, filter) => async (dispatch, getState) => {
        try {
            const { id, name, visibility } = filter

            const updatedFilter = {
                id,
                name,
                visibility,
                values: sGetNamedItemFilters(getState()),
            }

            const filterId = await apiSaveFilter(updatedFilter, currentUser)
            await dispatch(tFetchSavedFilters())
            await dispatch(tSelectSavedFilter(filterId))
            return filterId
        } catch (error) {
            console.log('Error (tSaveFilter): ', error)
            return error
        }
    }

export const tDeleteActiveFilter =
    (currentUser) => async (dispatch, getState) => {
        try {
            const filter = sGetActiveFilter(getState())
            await apiDeleteFilter(filter, currentUser)
            await dispatch(tFetchSavedFilters())
            await dispatch(acClearItemFilters())
            await dispatch(tSelectSavedFilter(null))
            return true
        } catch (error) {
            console.log('Error (tDeleteActiveFilter): ', error)
            return error
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

        await dispatch(tSaveFilter(currentUser, updatedFilter))

        return updatedFilter
    }
