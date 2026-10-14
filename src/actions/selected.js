import { apiGetDefaultFilters } from '../api/defaultFilters.js'
import { apiFetchDashboard } from '../api/fetchDashboard.js'
import { tGetMessages } from '../components/Item/MessagesItem/actions.js'
import { VIEW } from '../modules/dashboardModes.js'
import { getDashboardDefaultFilters } from '../modules/defaultFilters.js'
import { MESSAGES } from '../modules/itemTypes.js'
import { storePreferredDashboardId } from '../modules/localStorage.js'
import {
    SET_SELECTED,
    CLEAR_SELECTED,
    sGetSelectedId,
} from '../reducers/selected.js'
import { acAppendDashboards } from './dashboards.js'
import { acClearItemActiveTypes } from './itemActiveTypes.js'
import { acClearItemFilters, acSetItemFilters } from './itemFilters.js'
import { acSetActiveFilter } from './savedFilters.js'
import { acClearVisualizations } from './visualizations.js'

// actions

export const acSetSelected = (value) => ({
    type: SET_SELECTED,
    value,
})

export const acClearSelected = () => ({
    type: CLEAR_SELECTED,
})

// thunks
export const tSetSelectedDashboardById =
    (id, username, { online = true } = {}) =>
    async (dispatch, getState, dataEngine) => {
        const dashboard = await apiFetchDashboard(dataEngine, id, {
            mode: VIEW,
        })
        dispatch(
            acAppendDashboards([
                {
                    id: dashboard.id,
                    displayName: dashboard.displayName,
                    starred: dashboard.starred,
                },
            ])
        )

        if (username) {
            storePreferredDashboardId(username, id)
        }

        if (id !== sGetSelectedId(getState())) {
            // Offline recordings contain unfiltered data. Do not apply defaults
            // from the session cache when opening a cached dashboard offline.
            const defaults =
                online && !dashboard.embedded
                    ? getDashboardDefaultFilters(
                          await apiGetDefaultFilters(dataEngine),
                          dashboard
                      )
                    : {}
            dispatch(acSetItemFilters(defaults))
            dispatch(acSetActiveFilter(null))
            dispatch(acClearVisualizations())
            dispatch(acClearItemActiveTypes())
        }

        dashboard.dashboardItems.some((item) => item.type === MESSAGES) &&
            dispatch(tGetMessages(dataEngine))

        dispatch(acSetSelected(dashboard))
    }

export const tSetSelectedDashboardByIdOffline =
    (id, username) => (dispatch, getState) => {
        if (username) {
            storePreferredDashboardId(username, id)
        }

        if (id !== sGetSelectedId(getState())) {
            dispatch(acClearItemFilters())
            dispatch(acSetActiveFilter(null))
            dispatch(acClearVisualizations())
            dispatch(acClearItemActiveTypes())
        }

        dispatch(acSetSelected({ id }))
    }
