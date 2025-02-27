import { useCallback, useState } from 'react'

export const useSaveFitlerDialog = ({
    activeFilter,
    doSaveFilter,
    isLoading,
}) => {
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const [filterDialogData, setFilterDialogData] = useState(activeFilter)
    const [showScope, setShowScope] = useState(true)

    const openDialogForNewFilter = () => {
        setFilterDialogData({ id: 'new' })
        setDialogIsOpen(true)
    }

    const openDialogForRename = () => {
        setShowScope(false)
        setFilterDialogData(activeFilter)
        setDialogIsOpen(true)
    }

    const onClose = useCallback(() => {
        setDialogIsOpen(false)
        setShowScope(true)
    }, [])

    const onConfirm = useCallback(
        ({ name, visibility, id }) =>
            doSaveFilter({ ...activeFilter, name, visibility, id }).then(
                (resp) => {
                    if (resp) onClose()
                }
            ),
        [activeFilter, onClose, doSaveFilter]
    )

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
        },
    }
}
