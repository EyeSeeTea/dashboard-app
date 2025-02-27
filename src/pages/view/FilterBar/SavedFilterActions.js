import i18n from '@dhis2/d2-i18n'
import { colors, FlyoutMenu, IconMore16, MenuItem } from '@dhis2/ui'
import { isEqual } from 'lodash'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback } from 'react'
import { isFilterActionAllowed } from '../../../api/savedFilters.js'
import ConfirmActionDialog from '../../../components/ConfirmActionDialog.js'
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

    const toggleMoreActions = () => setMoreOptionsIsOpen((prev) => !prev)
    const closeDialog = () => setDialogIsOpen(false)

    const handleAction = useCallback(
        ({ action, label, skipCheck, dialogAction }) =>
            () => {
                if (skipCheck || currentUser.id === activeFilter.userId) {
                    action()
                } else {
                    setDialogMessage(
                        i18n.t(
                            `The Saved Filter you are attempting to ${
                                dialogAction || label.toLowerCase()
                            } was created by ${
                                activeFilter.userName
                            }. Do you still want to proceed?`
                        )
                    )
                    setConfirmDialogAction(() => () => {
                        action().then(closeDialog)
                    })
                    setDialogIsOpen(true)
                }
                setMoreOptionsIsOpen(false)
            },
        [activeFilter, currentUser]
    )

    const savedFilterActions = useMemo(() => {
        const actions = [
            {
                show: showFilterAction,
                label: i18n.t('Rename'),
                action: () => Promise.resolve(openDialogForRename()),
            },
            {
                show: showFilterAction,
                label: i18n.t('Delete'),
                action: () => doDeleteFilter(currentUser),
            },
            {
                show: savedFilterHasChanges && showFilterAction,
                label: i18n.t('Save'),
                action: () => doSaveFilter(activeFilter),
                dialogAction: 'update',
            },
            {
                show: savedFilterHasChanges,
                label: i18n.t('Save as new filter'),
                action: openDialogForNewFilter,
                skipCheck: true,
            },
            {
                show: showFilterAction,
                label:
                    activeFilter?.visibility === privateVisiblity
                        ? i18n.t('Make it public')
                        : i18n.t('Make it private'),
                action: () => doToggleFilterVisibility(currentUser),
                dialogAction:
                    activeFilter?.visibility === privateVisiblity
                        ? i18n.t('make public')
                        : i18n.t('make private'),
            },
        ]

        return (
            <FlyoutMenu>
                {actions.map(
                    ({ show, label, action, skipCheck, dialogAction }) =>
                        show && (
                            <MenuItem
                                key={label}
                                dense
                                label={label}
                                onClick={handleAction({
                                    action,
                                    label,
                                    skipCheck,
                                    dialogAction,
                                })}
                            />
                        )
                )}
            </FlyoutMenu>
        )
    }, [
        savedFilterHasChanges,
        showFilterAction,
        activeFilter,
        currentUser,
        doDeleteFilter,
        doSaveFilter,
        doToggleFilterVisibility,
        handleAction,
        openDialogForNewFilter,
        openDialogForRename,
    ])

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
                    disabledWhenOffline
                    onClick={toggleMoreActions}
                    icon={<IconMore16 color={colors.grey700} />}
                    component={savedFilterActions}
                />
                <ConfirmActionDialog
                    isLoading={isLoading}
                    open={dialogIsOpen}
                    title={i18n.t('Modify Saved Filter?')}
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
    isLoading: PropTypes.bool.isRequired,
    openDialogForNewFilter: PropTypes.func.isRequired,
    openDialogForRename: PropTypes.func.isRequired,
}
