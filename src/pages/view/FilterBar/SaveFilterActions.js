import React, { useCallback, useMemo, useState } from 'react'
import { colors, FlyoutMenu, IconMore16, MenuItem } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { privateVisiblity } from '../../../reducers/savedFilters'
import DropdownButton from '../../../components/DropdownButton/DropdownButton'
import { isEqual } from 'lodash'
import { isFilterActionAllowed } from '../../../api/savedFilters'

export const SavedFilterActions = ({
    openDialogForRename,
    openDialogForNewFilter,
    doSaveFilter,
    deleteFilter,
    toggleFilterVisibility,
    activeFilter,
    filters,
    hasActiveSavedFilter,
    currentUser,
}) => {
    const [moreOptionsIsOpen, setMoreOptionsIsOpen] = useState(false)
    const savedFilterHasChanges = useMemo(
        () => hasActiveSavedFilter && !isEqual(activeFilter.values, filters),
        [activeFilter, filters]
    )
    const showFilterAction = isFilterActionAllowed(activeFilter, currentUser)

    const toggleMoreActions = () => {
        setMoreOptionsIsOpen((prev) => !prev)
    }

    const handleSaveFilter = useCallback(
        async (filter = {}) => {
            await doSaveFilter(currentUser, { ...activeFilter, ...filter })
            setMoreOptionsIsOpen(false)
        },
        [currentUser, activeFilter, doSaveFilter]
    )

    const handleSaveNewFilter = useCallback(() => {
        openDialogForNewFilter()
        setMoreOptionsIsOpen(false)
    }, [openDialogForNewFilter])

    const handleRenameFilter = useCallback(() => {
        openDialogForRename()
        setMoreOptionsIsOpen(false)
    }, [openDialogForRename])

    const handleDeleteFilter = useCallback(async () => {
        await deleteFilter(currentUser)
        setMoreOptionsIsOpen(false)
    }, [currentUser])

    const handleToggleVisibility = useCallback(async () => {
        await toggleFilterVisibility(currentUser)
        setMoreOptionsIsOpen(false)
    }, [currentUser])

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
