import i18n from '@dhis2/d2-i18n'
import { Button, colors, FlyoutMenu, IconMore16, MenuItem } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useMemo, useCallback } from 'react'
import ConfirmActionDialog from '../../../components/ConfirmActionDialog.jsx'
import DropdownButton from '../../../components/DropdownButton/DropdownButton.jsx'
import {
    privateVisibility,
    savedFilterUserPermission,
} from '../../../modules/savedFilters.js'

const deleteId = 'delete'
const saveId = 'save'
const ignoreUnsavedChangesActions = [deleteId, saveId]

const getDialogText = () => {
    return {
        rename: {
            actionId: 'rename',
            label: i18n.t('Rename'),
        },
        [deleteId]: {
            actionId: deleteId,
            label: i18n.t('Delete'),
            confirmMessage: i18n.t('Yes, delete'),
        },
        [saveId]: {
            actionId: saveId,
            label: i18n.t('Save changes'),
            action: i18n.t('update'),
            confirmMessage: i18n.t('Yes, update'),
        },
        saveAsNew: {
            actionId: 'saveAsNew',
            label: i18n.t('Save as new filter'),
        },
        makePublic: {
            actionId: 'makePublic',
            label: i18n.t('Make it public'),
            action: i18n.t('make public'),
        },
        makePrivate: {
            actionId: 'makePrivate',
            label: i18n.t('Make it private'),
            action: i18n.t('make private'),
        },
    }
}

const getWarningDialogMessage = ({
    userName,
    actionId,
    isUserOwner,
    activeFilterHasChanges,
}) => {
    const dialogText = getDialogText()[actionId]
    const translationParams = {
        userName,
        action: dialogText.action || dialogText.label.toLowerCase(),
        label: dialogText.label.toLowerCase(),
    }

    let message = ''
    let confirmMessage =
        dialogText.confirmMessage ||
        i18n.t('Yes, save changes and {{ label }}', translationParams)
    const scopeWarning =
        !ignoreUnsavedChangesActions.includes(actionId) &&
        activeFilterHasChanges
            ? i18n.t(
                  ' If you proceed, these changes will be saved along with the new scope of the filter.'
              )
            : ''

    if (!isUserOwner) {
        message =
            activeFilterHasChanges &&
            !ignoreUnsavedChangesActions.includes(actionId)
                ? i18n.t(
                      'The saved filter you are trying to {{ action }} was created by {{ userName }} and has unsaved changes.',
                      translationParams
                  )
                : i18n.t(
                      'The saved filter you are trying to {{ action }} was created by {{ userName }}.',
                      translationParams
                  )
        if (!activeFilterHasChanges) {
            confirmMessage = i18n.t('Yes, {{ action }}', translationParams)
        }
    } else if (activeFilterHasChanges) {
        message = i18n.t(
            'The saved filter you are trying to {{ action }} has unsaved changes.',
            translationParams
        )
    }
    return {
        message: [
            message,
            scopeWarning,
            i18n.t('Would you like to continue?'),
        ].join(' '),
        confirmMessage,
    }
}

export const SavedFilterActions = ({
    openDialogForRename,
    openDialogForNewFilter,
    doSaveFilter,
    doDeleteFilter,
    doToggleFilterVisibility,
    activeFilter,
    activeFilterHasChanges,
    hasActiveSavedFilter,
    currentUser,
    isLoading,
}) => {
    const [moreOptionsIsOpen, setMoreOptionsIsOpen] = useState(false)
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const [confirmDialogMessage, setConfirmDialogMessage] = useState('')
    const [dialogMessage, setDialogMessage] = useState('')
    const [confirmDialogAction, setConfirmDialogAction] = useState(
        () => () => {}
    )

    const filterPermissions = useMemo(
        () => savedFilterUserPermission({ filter: activeFilter, currentUser }),
        [activeFilter, currentUser]
    )

    const toggleMoreActions = () => setMoreOptionsIsOpen((prev) => !prev)
    const closeDialog = () => setDialogIsOpen(false)
    const dialogTextMap = getDialogText()

    const handleAction = useCallback(
        ({ actionFn, actionId, skipCheck }) =>
            () => {
                const isUserOwner = currentUser.id === activeFilter.userId
                if (
                    skipCheck ||
                    (isUserOwner &&
                        (!activeFilterHasChanges ||
                            ignoreUnsavedChangesActions.includes(actionId)))
                ) {
                    actionFn()
                } else {
                    const { message, confirmMessage } = getWarningDialogMessage(
                        {
                            actionId,
                            userName: activeFilter.userName,
                            isUserOwner,
                            activeFilterHasChanges,
                        }
                    )

                    setDialogMessage(message)
                    setConfirmDialogMessage(confirmMessage)

                    setConfirmDialogAction(() => () => {
                        actionFn().then(closeDialog)
                    })
                    setDialogIsOpen(true)
                }
                setMoreOptionsIsOpen(false)
            },
        [activeFilter, currentUser, activeFilterHasChanges]
    )

    const savedFilterActions = useMemo(() => {
        const actions = [
            {
                show: filterPermissions.edit,
                ...dialogTextMap.rename,
                actionFn: () => Promise.resolve(openDialogForRename()),
            },
            {
                show: filterPermissions.delete,
                ...dialogTextMap.delete,
                actionFn: () => doDeleteFilter(currentUser),
            },
            {
                show: activeFilterHasChanges && filterPermissions.edit,
                ...dialogTextMap.save,
                actionFn: () => doSaveFilter(activeFilter),
            },
            {
                show: activeFilterHasChanges && filterPermissions.create,
                ...dialogTextMap.saveAsNew,
                actionFn: openDialogForNewFilter,
                skipCheck: true,
            },
            {
                show: filterPermissions.toggleVisibility,
                ...(activeFilter?.visibility === privateVisibility
                    ? dialogTextMap.makePublic
                    : dialogTextMap.makePrivate),

                actionFn: () => doToggleFilterVisibility(currentUser),
            },
        ]

        return (
            <FlyoutMenu>
                {actions.map(
                    ({ show, actionFn, actionId, label, skipCheck }) =>
                        show && (
                            <MenuItem
                                key={label}
                                dense
                                label={label}
                                onClick={handleAction({
                                    actionFn,
                                    actionId,
                                    skipCheck,
                                })}
                            />
                        )
                )}
            </FlyoutMenu>
        )
    }, [
        activeFilterHasChanges,
        filterPermissions,
        activeFilter,
        currentUser,
        doDeleteFilter,
        doSaveFilter,
        doToggleFilterVisibility,
        handleAction,
        openDialogForNewFilter,
        openDialogForRename,
        dialogTextMap,
    ])

    if (
        filterPermissions.delete ||
        filterPermissions.edit ||
        (filterPermissions.create &&
            (activeFilterHasChanges || !hasActiveSavedFilter))
    ) {
        if (hasActiveSavedFilter) {
            return (
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
                    >
                        <wbr />
                    </DropdownButton>
                    <ConfirmActionDialog
                        position="top"
                        isLoading={isLoading}
                        open={dialogIsOpen}
                        title={i18n.t('Modify Saved Filter?')}
                        message={dialogMessage}
                        cancelLabel={i18n.t('Cancel')}
                        confirmLabel={confirmDialogMessage}
                        onConfirm={confirmDialogAction}
                        onCancel={closeDialog}
                    />
                </>
            )
        } else {
            return (
                <Button secondary small onClick={openDialogForNewFilter}>
                    {i18n.t('Save')}
                </Button>
            )
        }
    }

    return <></>
}

SavedFilterActions.propTypes = {
    activeFilter: PropTypes.object.isRequired,
    activeFilterHasChanges: PropTypes.bool.isRequired,
    currentUser: PropTypes.object.isRequired,
    doDeleteFilter: PropTypes.func.isRequired,
    doSaveFilter: PropTypes.func.isRequired,
    doToggleFilterVisibility: PropTypes.func.isRequired,
    hasActiveSavedFilter: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    openDialogForNewFilter: PropTypes.func.isRequired,
    openDialogForRename: PropTypes.func.isRequired,
}
