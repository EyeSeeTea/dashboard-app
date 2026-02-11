import { useCallback, useState } from 'react'
import {
    NEW_FILTER_ID,
    userFilterPermissions,
    validVisibility,
} from '../../../modules/savedFilters.js'
import { useSelector } from 'react-redux'
import { sGetSelected } from '../../../reducers/selected'

export const useSaveFitlerDialog = ({
    activeFilter,
    doSaveFilter,
    isLoading,
    currentUser,
}) => {
    const selectedDashboard = useSelector((state) => sGetSelected(state))
    const selectedDashboardId = selectedDashboard?.id

    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const [filterDialogData, setFilterDialogData] = useState(activeFilter)
    const [showScope, setShowScope] = useState(true)

    const openDialogForNewFilter = useCallback(() => {
        setFilterDialogData({
            id: NEW_FILTER_ID,
            dashboardId: selectedDashboardId,
        })
        setDialogIsOpen(true)
    }, [selectedDashboardId])

    const openDialogForRename = useCallback(() => {
        setShowScope(false)
        setFilterDialogData(activeFilter)
        setDialogIsOpen(true)
    }, [activeFilter])

    const onClose = useCallback(() => {
        setDialogIsOpen(false)
        setShowScope(true)
    }, [])

    const onConfirm = useCallback(
        ({ name, visibility, id }) => {
            doSaveFilter({
                ...activeFilter,
                name,
                visibility,
                id,
                ...(id === NEW_FILTER_ID && {
                    userName: undefined,
                    userId: undefined,
                }),
            }).then((resp) => resp && onClose())
        },
        [activeFilter, onClose, doSaveFilter]
    )

    const { permissions } = userFilterPermissions(currentUser)
    return {
        openDialogForNewFilter,
        openDialogForRename,
        filterDialogIsOpen: dialogIsOpen,
        dialogProps: {
            open: dialogIsOpen,
            filter: filterDialogData,
            showScope,
            onCancel: onClose,
            onConfirm,
            isLoading,
            filterVisibility: validVisibility[permissions?.create],
        },
    }
}
