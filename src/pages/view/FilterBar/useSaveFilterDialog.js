import { useCallback, useState } from 'react'

const NEW_FILTER_ID = 'new'

export const useSaveFitlerDialog = ({
    activeFilter,
    doSaveFilter,
    isLoading,
}) => {
    const [dialogIsOpen, setDialogIsOpen] = useState(false)
    const [filterDialogData, setFilterDialogData] = useState(activeFilter)
    const [showScope, setShowScope] = useState(true)

    const openDialogForNewFilter = useCallback(() => {
        setFilterDialogData({ id: NEW_FILTER_ID })
        setDialogIsOpen(true)
    }, [])

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
                ...(id === NEW_FILTER_ID && { userName: null, userId: null }),
            }).then((resp) => resp && onClose())
        },
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
