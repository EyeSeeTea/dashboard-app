const all = 'all'
export const privateVisibility = 'private'
export const publicVisibility = 'public'
export const NEW_FILTER_ID = 'new'

export const validVisibility = {
    [privateVisibility]: [privateVisibility],
    [all]: [privateVisibility, publicVisibility],
}

//requireOwner applies to edit and delete
//toggle visibility requires delete permission and create permission for the new visibility
//if multiple roles are assigned, the most permissive role is used
const SAVED_FILTERS_ROLES_PERMISSIONS = [
    {
        role: 'Saved Filters Admin',
        permissions: {
            create: all,
            view: all,
            edit: all,
            delete: all,
            requireOwner: false,
        },
    },
    {
        role: 'Saved Filters Create Public',
        permissions: {
            create: all,
            view: all,
            edit: all,
            delete: all,
            requireOwner: true,
        },
    },
    {
        role: 'Saved Filters Create',
        permissions: {
            create: privateVisibility,
            view: all,
            edit: privateVisibility,
            delete: privateVisibility,
            requireOwner: true,
        },
    },
    {
        role: 'Saved Filters',
        permissions: {
            view: all,
        },
    },
]

const DEFAULT_FILTER_PERMISSIONS = {
    role: '',
    permissions: {},
}

const validateVisibility = (permission, visibility) =>
    (validVisibility[permission] || []).includes(visibility)

const validateOwner = ({ requireOwner, userId, filterUserId }) =>
    !requireOwner || userId === filterUserId

export const userFilterPermissions = (currentUser) => {
    if (!currentUser || !currentUser.userRoles) {
        return DEFAULT_FILTER_PERMISSIONS
    } else {
        return (
            SAVED_FILTERS_ROLES_PERMISSIONS.find(({ role }) =>
                currentUser?.userRoles.some(({ name }) => name === role)
            ) || DEFAULT_FILTER_PERMISSIONS
        )
    }
}
export const savedFilterUserPermission = ({ filter, currentUser }) => {
    const rolePermissions = userFilterPermissions(currentUser)

    if (rolePermissions?.permissions) {
        const {
            view,
            create,
            edit,
            delete: del,
            requireOwner,
        } = rolePermissions.permissions
        const isOwnerValid = validateOwner({
            requireOwner,
            userId: currentUser.id,
            filterUserId: filter.userId,
        })
        const toggledVisibility =
            filter.visibility === publicVisibility
                ? privateVisibility
                : publicVisibility
        return {
            create:
                filter.id === NEW_FILTER_ID
                    ? validateVisibility(create, filter.visibility)
                    : !!create,
            view: validateVisibility(view, filter.visibility),
            edit: validateVisibility(edit, filter.visibility) && isOwnerValid,
            delete: validateVisibility(del, filter.visibility) && isOwnerValid,
            toggleVisibility:
                validateVisibility(del, filter.visibility) &&
                validateVisibility(create, toggledVisibility) &&
                isOwnerValid,
        }
    }

    return {}
}
