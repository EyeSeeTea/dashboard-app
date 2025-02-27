import i18n from '@dhis2/d2-i18n'
import { colors, FlyoutMenu, IconMore16, MenuItem } from '@dhis2/ui'
import { isEqual } from 'lodash'
import PropTypes from 'prop-types'
import React, { useCallback, useMemo, useState } from 'react'
import { isFilterActionAllowed } from '../../../api/savedFilters.js'
import DropdownButton from '../../../components/DropdownButton/DropdownButton.js'
import { privateVisiblity } from '../../../reducers/savedFilters.js'
import ConfirmActionDialog from '../../../components/ConfirmActionDialog'

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
    isLoading,
}) => {
    const [moreOptionsIsOpen, setMoreOptionsIsOpen] = useState(false)
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')
    const [confirmDialogAction, setConfirmDialogAction] = useState(
        () => () => {}
    )

    const savedFilterHasChanges = useMemo(
        () => hasActiveSavedFilter && !isEqual(activeFilter.values, filters),
        [hasActiveSavedFilter, activeFilter, filters]
    )
    const showFilterAction = isFilterActionAllowed(activeFilter, currentUser)

    const toggleMoreActions = () => {
        setMoreOptionsIsOpen((prev) => !prev)
    }

    const closeDialog = useCallback(() => {
        setDialogIsOpen(false)
    }, [])

    const handleAction = useCallback(
        ({ action, label, skipCheck, dialogAction }) =>
            () => {
                if (skipCheck || currentUser.id === activeFilter.userId) {
                    console.log('SKIP')
                    action()
                } else {
                    const messageAction = dialogAction || label.toLowerCase()
                    setDialogMessage(
                        i18n.t(
                            `The Saved Filter you are attempting to ${messageAction} was created by ${activeFilter.userName}. Do you still want to proceed`
                        )
                    )
                    setConfirmDialogAction(() => () => {
                        action().then(() => closeDialog())
                    })
                    setDialogIsOpen(true)
                    setMoreOptionsIsOpen(false)
                }
            },
        []
    )

    const handleSaveFilter = useCallback(
        () => doSaveFilter(activeFilter),
        [activeFilter, doSaveFilter]
    )

    const handleSaveNewFilter = useCallback(
        () => Promise.resolve(openDialogForNewFilter()),
        [openDialogForNewFilter]
    )

    const handleRenameFilter = useCallback(
        () => Promise.resolve(openDialogForRename()),
        [openDialogForRename]
    )

    const handleDeleteFilter = useCallback(
        () => doDeleteFilter(currentUser),
        [currentUser, doDeleteFilter]
    )

    const handleToggleVisibility = useCallback(
        () => doToggleFilterVisibility(currentUser),
        [currentUser, doToggleFilterVisibility]
    )

    const actionsMap = useMemo(
        () => ({
            rename: {
                show: showFilterAction,
                label: i18n.t('Rename'),
                action: handleRenameFilter,
            },
            delete: {
                show: showFilterAction,
                label: i18n.t('Delete'),
                action: handleDeleteFilter,
            },
            save: {
                show: savedFilterHasChanges && showFilterAction,
                label: i18n.t('Save'),
                action: handleSaveFilter,
                dialogAction: 'update',
            },
            saveAsNew: {
                show: savedFilterHasChanges,
                label: i18n.t('Save as new filter'),
                action: handleSaveNewFilter,
                skipCheck: true,
            },
            toggleVisibility: {
                show: showFilterAction,
                label:
                    activeFilter?.visibility === privateVisiblity
                        ? i18n.t('Make it public')
                        : i18n.t('Make it private'),
                action: handleToggleVisibility,
                dialogAction:
                    activeFilter?.visibility === privateVisiblity
                        ? i18n.t('make public')
                        : i18n.t('make private'),
            },
        }),
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

    const savedFilterActions = useMemo(
        () => (
            <FlyoutMenu>
                {Object.values(actionsMap).map(
                    (actionItem) =>
                        actionItem.show && (
                            <MenuItem
                                dense
                                label={actionItem.label}
                                onClick={handleAction(actionItem)}
                            />
                        )
                )}
            </FlyoutMenu>
        ),
        [actionsMap]
    )

    return (
        hasActiveSavedFilter &&
        (showFilterAction || savedFilterHasChanges) && (
            <>
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
                <ConfirmActionDialog
                    isLoading={isLoading}
                    open={dialogIsOpen}
                    title={i18n.t('Saved Filter')}
                    message={dialogMessage}
                    cancelLabel={i18n.t('Cancel')}
                    confirmLabel={i18n.t('Confirm')}
                    onConfirm={confirmDialogAction}
                    onCancel={closeDialog}
                />
            </>
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
