import { getRelativePeriodsName } from '@dhis2/analytics'
import { FILTER_PE } from '../actions/itemFilters.js'

export const getDashboardDefaultFilters = (configuration, dashboard) => {
    if (
        dashboard.embedded ||
        (dashboard.restrictFilters &&
            !dashboard.allowedFilters?.includes(FILTER_PE))
    ) {
        return {}
    }

    const periods = configuration?.[dashboard.id]?.[FILTER_PE]
    if (!Array.isArray(periods) || periods.length !== 1) {
        return {}
    }

    const id = periods[0]?.id
    const relativePeriodNames = getRelativePeriodsName()
    if (
        typeof id !== 'string' ||
        !Object.prototype.hasOwnProperty.call(relativePeriodNames, id)
    ) {
        return {}
    }

    return { [FILTER_PE]: [{ id, name: relativePeriodNames[id] }] }
}
