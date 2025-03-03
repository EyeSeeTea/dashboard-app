import reducer, {
    DEFAULT_STATE,
    SET_DASHBOARDS_STARRED_FILTER,
} from '../dashboardsStarredFilter.js'

describe('dashboards filter reducer', () => {
    it('returns false as a default state', () => {
        const actualState = reducer(DEFAULT_STATE, {})
        expect(actualState).toEqual(false)
    })

    it('set starred filter to starred', () => {
        const starredValue = true
        const action = {
            type: SET_DASHBOARDS_STARRED_FILTER,
            value: starredValue,
        }

        const actualState = reducer(undefined, action)

        expect(actualState).toEqual(starredValue)
    })
})
