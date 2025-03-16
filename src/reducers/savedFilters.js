import i18n from '@dhis2/d2-i18n'
import isEqual from 'lodash/isEqual.js'
import { sGetDimensions } from './dimensions.js'
import { sGetItemFiltersRoot } from './itemFilters.js'

export const buildSavedFilters = (state) => {
    const filters = sGetItemFiltersRoot(state)
    const dimensions = sGetDimensions(state)

    return Object.keys(filters).reduce((arr, id) => {
        return [
            ...arr,
            {
                id: id,
                name: dimensions.find((dimension) => dimension.id === id).name,
                values: filters[id].map(({ id, displayName, name, path }) => ({
                    id,
                    name: displayName || name,
                    ...(path && { path }),
                })),
            },
        ]
    }, [])
}

export const SET_SAVED_FILTERS = 'SET_SAVED_FILTERS'
export const SET_ACTIVE_FILTER = 'SET_ACTIVE_FILTER'
export const SET_LOADING_SAVED_FILTERS = 'SET_LOADING_SAVED_FILTERS'

export const privateVisibility = 'private'
export const publicVisibility = 'public'
export const filterVisibility = [privateVisibility, publicVisibility]

export const DEFAULT_ACTIVE_FILTER = {
    id: null,
    name: i18n.t('Saved Filters'),
    visibility: privateVisibility,
}

const DEFAULT_FILTERS = {
    [privateVisibility]: [],
    [publicVisibility]: [],
}

export const DEFAULT_STATE = {
    filters: DEFAULT_FILTERS,
    active: DEFAULT_ACTIVE_FILTER,
    loading: false,
}

export default (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case SET_SAVED_FILTERS: {
            return {
                ...state,
                filters: action.filters,
            }
        }
        case SET_ACTIVE_FILTER: {
            return {
                ...state,
                active: action.filter ?? DEFAULT_ACTIVE_FILTER,
            }
        }
        case SET_LOADING_SAVED_FILTERS:
            return {
                ...state,
                loading: action.loading,
            }
        default:
            return state
    }
}

// selector

//{private: [...], public: [...]}
export const sGetSavedFiltersVisibilityMap = (state) =>
    state.savedFilters.filters

export const sGetSavedFiltersList = (state) =>
    Object.values(sGetSavedFiltersVisibilityMap(state)).flat()

//{id: uid, name: string, visibility: "private"|"public", userId: string, userName: string, values: [{id: dimensionId, name: dimensionName, values: []}]}
export const sGetActiveFilter = (state) => {
    const activeFilter = state.savedFilters.active
    const filter = sGetSavedFiltersList(state).find(
        (f) => f.id === activeFilter.id
    )
    return { ...filter, ...activeFilter }
}

export const sGetLoadingSavedFilters = (state) => state.savedFilters.loading

export const sActiveFilterHasChanges = (state) => {
    const activeFilters = sGetActiveFilter(state)
    return (
        (activeFilters.id &&
            !isEqual(activeFilters.values, buildSavedFilters(state))) ||
        false
    )
}
