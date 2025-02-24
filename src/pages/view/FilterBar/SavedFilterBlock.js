import { Button } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import React, { useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { sGetNamedItemFilters } from '../../../reducers/itemFilters'
import { sGetActiveFilter } from '../../../reducers/savedFilters'
import { connect } from 'react-redux'
import {
    acSetActiveFilter,
    tDeleteActiveFilter,
    tSaveFilter,
    tToggleActiveFilterVisibility,
} from '../../../actions/savedFilters'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import SaveFilterDialog from './SaveFilterDialog'
import { useCachedDataQuery } from '@dhis2/analytics'
import { useSaveFitlerDialog } from './useSaveFilterDialog'
import { SavedFilterActions } from './SaveFilterActions'

const SavedFilterBlock = ({
    filters,
    activeFilter,
    saveFilter,
    updateActiveFilter,
    deleteFilter,
    toggleFilterVisibility,
}) => {
    const { isConnected: online } = useDhis2ConnectionStatus()
    const { currentUser } = useCachedDataQuery()

    const hasActiveSavedFilter = Boolean(activeFilter.id)

    const doSaveFilter = useCallback(
        (filter = {}) => {
            return saveFilter(currentUser, { ...activeFilter, ...filter })
        },
        [currentUser, activeFilter]
    )

    const {
        openDialogForNewFilter,
        openDialogForRename,
        filterDialogIsOpen,
        dialogProps,
    } = useSaveFitlerDialog({ activeFilter, doSaveFilter })

    const savedFilterActionProps = useMemo(
        () => ({
            openDialogForRename,
            openDialogForNewFilter,
            doSaveFilter,
            deleteFilter,
            toggleFilterVisibility,
            activeFilter,
            filters,
            hasActiveSavedFilter,
            currentUser,
        }),
        [
            openDialogForRename,
            openDialogForNewFilter,
            doSaveFilter,
            deleteFilter,
            toggleFilterVisibility,
            activeFilter,
            filters,
            hasActiveSavedFilter,
            currentUser,
        ]
    )

    useEffect(() => {
        if (!filters.length) {
            updateActiveFilter(null)
        }
    }, [filters])

    return (
        <>
            {online && !hasActiveSavedFilter && (
                <Button secondary small onClick={openDialogForNewFilter}>
                    {i18n.t('Save')}
                </Button>
            )}
            <SavedFilterActions {...savedFilterActionProps} />
            {filterDialogIsOpen && <SaveFilterDialog {...dialogProps} />}
        </>
    )
}

SavedFilterBlock.propTypes = {
    filters: PropTypes.array.isRequired,
    updateActiveFilter: PropTypes.func.isRequired,
    deleteFilter: PropTypes.func.isRequired,
    toggleFilterVisibility: PropTypes.func.isRequired,
    activeFilter: PropTypes.object,
}

SavedFilterBlock.defaultProps = {
    filters: [],
}

const mapStateToProps = (state) => ({
    filters: sGetNamedItemFilters(state),
    activeFilter: sGetActiveFilter(state),
})

export default connect(mapStateToProps, {
    saveFilter: tSaveFilter,
    updateActiveFilter: acSetActiveFilter,
    deleteFilter: tDeleteActiveFilter,
    toggleFilterVisibility: tToggleActiveFilterVisibility,
})(SavedFilterBlock)
