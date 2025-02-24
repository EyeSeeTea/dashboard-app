import i18n from '@dhis2/d2-i18n'

export const SET_SAVED_FILTERS = 'SET_SAVED_FILTERS'
export const SET_ACTIVE_FILTER = 'SET_ACTIVE_FILTER'

export const privateVisiblity = 'private'
export const publicVisibility = 'public'
export const filterVisibility = [privateVisiblity, publicVisibility]

export const DEFAULT_ACTIVE_FILTER = {
    id: null,
    name: i18n.t('Saved Filters'),
    visibility: privateVisiblity,
}

const DEFAULT_FILTERS = {
    [privateVisiblity]: [],
    [publicVisibility]: [],
}

export const DEFAULT_STATE = {
    filters: DEFAULT_FILTERS,
    active: DEFAULT_ACTIVE_FILTER,
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
