import { DEFAULT_STATE } from '../reducers/dashboardsStarredFilter.js'
import {
    apiGetUserDataStoreValue,
    apiPostUserDataStoreValue,
} from './userDataStore.js'

const KEY_SHOW_STARRED_DASHBOARDS = 'showStarred'

export const apiGetStarredDashboard = (dataEngine) =>
    apiGetUserDataStoreValue(
        KEY_SHOW_STARRED_DASHBOARDS,
        DEFAULT_STATE,
        dataEngine
    )

export const apiPostStarredDashboard = (value, dataEngine) =>
    apiPostUserDataStoreValue(KEY_SHOW_STARRED_DASHBOARDS, value, dataEngine)
