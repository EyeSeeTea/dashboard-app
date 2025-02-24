import { useCachedDataQuery } from '@dhis2/analytics'
import { useDhis2ConnectionStatus } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useMemo } from 'react'
import { connect } from 'react-redux'
import {
    acSetActiveFilter,
    acSetLoadingSavedFilters,
    tDeleteActiveFilter,
    tSaveFilter,
    tToggleActiveFilterVisibility,
} from '../../../actions/savedFilters.js'
import { sGetNamedItemFilters } from '../../../reducers/itemFilters.js'
import {
    sGetActiveFilter,
    sGetLoadingSavedFilters,
} from '../../../reducers/savedFilters.js'
import { SavedFilterActions } from './SavedFilterActions.js'
import SaveFilterDialog from './SaveFilterDialog.js'
import { useSaveFitlerDialog } from './useSaveFilterDialog.js'

const SavedFilterBlock = ({
    activeFilter,
    filters,
    isLoading,
    saveFilter,
    setLoadingSavedFilters,
    updateActiveFilter,
    deleteFilter,
    toggleFilterVisibility,
}) => {
    const { isConnected: online } = useDhis2ConnectionStatus()
    const { currentUser } = useCachedDataQuery()

    const hasActiveSavedFilter = Boolean(activeFilter.id)

    const handleFilterAction = async (actionFn) => {
        setLoadingSavedFilters(true)
        return actionFn().finally(() => setLoadingSavedFilters(false))
    }

    const doSaveFilter = useCallback(
        (filter = {}) =>
            handleFilterAction(() =>
                saveFilter(currentUser, { ...activeFilter, ...filter })
            ),
        [currentUser, activeFilter]
    )

    const doDeleteFilter = useCallback(
        () => handleFilterAction(() => deleteFilter(currentUser)),
        [currentUser]
    )

    const doToggleFilterVisibility = useCallback(
        () => handleFilterAction(() => toggleFilterVisibility(currentUser)),
        [currentUser]
    )

    const {
        openDialogForNewFilter,
        openDialogForRename,
        filterDialogIsOpen,
        dialogProps,
    } = useSaveFitlerDialog({ activeFilter, doSaveFilter, isLoading })

    const savedFilterActionProps = useMemo(
        () => ({
            openDialogForRename,
            openDialogForNewFilter,
            doSaveFilter,
            doDeleteFilter,
            doToggleFilterVisibility,
            activeFilter,
            filters,
            hasActiveSavedFilter,
            currentUser,
        }),
        [
            openDialogForRename,
            openDialogForNewFilter,
            doSaveFilter,
            doDeleteFilter,
            doToggleFilterVisibility,
            activeFilter,
            filters,
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
    activeFilter: PropTypes.object.isRequired,
    deleteFilter: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    saveFilter: PropTypes.func.isRequired,
    setLoadingSavedFilters: PropTypes.func.isRequired,
    toggleFilterVisibility: PropTypes.func.isRequired,
    updateActiveFilter: PropTypes.func.isRequired,
}

SavedFilterBlock.defaultProps = {
    filters: [],
}

const mapStateToProps = (state) => ({
    activeFilter: sGetActiveFilter(state),
    filters: sGetNamedItemFilters(state),
    isLoading: sGetLoadingSavedFilters(state),
})

export default connect(mapStateToProps, {
    saveFilter: tSaveFilter,
    updateActiveFilter: acSetActiveFilter,
    deleteFilter: tDeleteActiveFilter,
    setLoadingSavedFilters: acSetLoadingSavedFilters,
    toggleFilterVisibility: tToggleActiveFilterVisibility,
})(SavedFilterBlock)
