import i18n from '@dhis2/d2-i18n'
import { colors, FlyoutMenu, IconMore16, MenuItem } from '@dhis2/ui'
import { isEqual } from 'lodash'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useState } from 'react'
import { isFilterActionAllowed } from '../../../api/savedFilters.js'
import DropdownButton from '../../../components/DropdownButton/DropdownButton.js'
import { privateVisiblity } from '../../../reducers/savedFilters.js'

export const SavedFilterActions = ({
    openDialogForRename,
    openDialogForNewFilter,
    doSaveFilter,
    doDeleteFilter,
    doToggleFilterVisibility,
    activeFilter,
    filters,
    hasActiveSavedFilter,
    currentUser,
}) => {
    const [moreOptionsIsOpen, setMoreOptionsIsOpen] = useState(false)
    const savedFilterHasChanges = useMemo(
        () => hasActiveSavedFilter && !isEqual(activeFilter.values, filters),
        [hasActiveSavedFilter, activeFilter, filters]
    )
    const showFilterAction = isFilterActionAllowed(activeFilter, currentUser)

    const toggleMoreActions = () => {
        setMoreOptionsIsOpen((prev) => !prev)
    }

    const handleSaveFilter = useCallback(async () => {
        await doSaveFilter(activeFilter)
        setMoreOptionsIsOpen(false)
    }, [activeFilter, doSaveFilter])

    const handleSaveNewFilter = useCallback(() => {
        openDialogForNewFilter()
        setMoreOptionsIsOpen(false)
    }, [openDialogForNewFilter])

    const handleRenameFilter = useCallback(() => {
        openDialogForRename()
        setMoreOptionsIsOpen(false)
    }, [openDialogForRename])

    const handleDeleteFilter = useCallback(async () => {
        await doDeleteFilter(currentUser)
        setMoreOptionsIsOpen(false)
    }, [currentUser, doDeleteFilter])

    const handleToggleVisibility = useCallback(async () => {
        await doToggleFilterVisibility(currentUser)
        setMoreOptionsIsOpen(false)
    }, [currentUser, doToggleFilterVisibility])

    const savedFilterActions = useMemo(
        () => (
            <FlyoutMenu>
                {showFilterAction && (
                    <>
                        <MenuItem
                            dense
                            label={i18n.t('Rename')}
                            onClick={handleRenameFilter}
                        />
                        <MenuItem
                            dense
                            label={i18n.t('Delete')}
                            onClick={handleDeleteFilter}
                        />
                    </>
                )}
                {savedFilterHasChanges && (
                    <>
                        {showFilterAction && (
                            <MenuItem
                                dense
                                label={i18n.t('Save')}
                                onClick={handleSaveFilter}
                            />
                        )}
                        <MenuItem
                            dense
                            label={i18n.t('Save as new filter')}
                            onClick={handleSaveNewFilter}
                        />
                    </>
                )}
                {showFilterAction && (
                    <MenuItem
                        dense
                        label={
                            activeFilter?.visibility === privateVisiblity
                                ? i18n.t('Make it public')
                                : i18n.t('Make it private')
                        }
                        onClick={handleToggleVisibility}
                    />
                )}
            </FlyoutMenu>
        ),
        [
            savedFilterHasChanges,
            handleRenameFilter,
            handleDeleteFilter,
            handleSaveNewFilter,
            handleSaveFilter,
            handleToggleVisibility,
            activeFilter,
            showFilterAction,
        ]
    )

    return (
        hasActiveSavedFilter &&
        (showFilterAction || savedFilterHasChanges) && (
            <DropdownButton
                dataTest="more-actions-button"
                secondary
                small
                showArrow={false}
                open={moreOptionsIsOpen}
                disabledWhenOffline={true}
                onClick={toggleMoreActions}
                icon={<IconMore16 color={colors.grey700} />}
                component={savedFilterActions}
            >
                <wbr />
            </DropdownButton>
        )
    )
}

SavedFilterActions.propTypes = {
    activeFilter: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    doDeleteFilter: PropTypes.func.isRequired,
    doSaveFilter: PropTypes.func.isRequired,
    doToggleFilterVisibility: PropTypes.func.isRequired,
    filters: PropTypes.array.isRequired,
    hasActiveSavedFilter: PropTypes.bool.isRequired,
    openDialogForNewFilter: PropTypes.func.isRequired,
    openDialogForRename: PropTypes.func.isRequired,
}
