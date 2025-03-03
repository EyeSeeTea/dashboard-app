export const SET_DASHBOARDS_STARRED_FILTER = 'SET_DASHBOARDS_STARRED_FILTER'

export const DEFAULT_STATE = false
export const STARRED_STATE = true

export default (state = DEFAULT_STATE, action) => {
    switch (action.type) {
        case SET_DASHBOARDS_STARRED_FILTER: {
            return action.value ?? DEFAULT_STATE
        }
        default:
            return state
    }
}

// selectors

export const sGetDashboardsStarredFilter = (state) =>
    state.dashboardsStarredFilter
