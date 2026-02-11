const NAMESPACE = 'dashboard'

const hasDashboardNamespace = async (dataEngine) => {
    const dataStore = await dataEngine.query({
        dataStore: {
            resource: 'dataStore',
        },
    })

    return !!dataStore?.dataStore?.find((ns) => ns === NAMESPACE)
}

const hasNamespaceKey = async (dataEngine, key) => {
    const hasNamespace = await hasDashboardNamespace(dataEngine)
    const keys = hasNamespace
        ? await dataEngine.query({
              keys: {
                  resource: `dataStore/${NAMESPACE}`,
              },
          })
        : {}

    return !!keys.keys?.find((k) => k === key)
}

const createValue = async (dataEngine, key, value) => {
    return await dataEngine.mutate({
        resource: `dataStore/${NAMESPACE}/${key}`,
        type: 'create',
        data: value,
    })
}

export const apiPostDataStoreValue = async (key, value, dataEngine) => {
    const hasKey = await hasNamespaceKey(dataEngine, key)

    if (!hasKey) {
        return await createValue(dataEngine, key, value)
    } else {
        return await dataEngine.mutate({
            resource: `dataStore/${NAMESPACE}/${key}`,
            type: 'update',
            data: value,
        })
    }
}

export const apiGetDataStoreValue = async (key, defaultValue, dataEngine) => {
    const hasKey = await hasNamespaceKey(dataEngine, key)

    if (hasKey) {
        const result = await dataEngine.query({
            [key]: {
                resource: `dataStore/${NAMESPACE}/${key}`,
            },
        })
        return result[key]
    } else {
        await createValue(dataEngine, key, defaultValue)
        return defaultValue
    }
}

// export const apiPostDataStoreValue = async (key, value) => {
//     const d2 = await getInstance()
//     return apiPostGenericDataStoreValue(key, value, d2.dataStore)
// }

// export const apiGetDataStoreValue = async (key, defaultValue) => {
//     const d2 = await getInstance()
//     return apiGetGenericDataStoreValue(key, defaultValue, d2.dataStore)
// }

// import { getInstance } from 'd2'

// export const NAMESPACE = 'dashboard'

// const hasDashboardNamespace = async (d2Store) => await d2Store.has(NAMESPACE)

// const getNamespace = async (d2Store) => {
//     const hasNamespace = await hasDashboardNamespace(d2Store)

//     return hasNamespace
//         ? await d2Store.get(NAMESPACE)
//         : await d2Store.create(NAMESPACE)
// }

// export const apiPostGenericDataStoreValue = async (key, value, d2Store) => {
//     const ns = await getNamespace(d2Store)

//     return ns.set(key, value)
// }

// export const apiGetGenericDataStoreValue = async (
//     key,
//     defaultValue,
//     d2Store
// ) => {
//     const ns = await getNamespace(d2Store)
//     const hasKey = ns?.keys?.find((k) => k === key)

//     if (hasKey) {
//         return await ns.get(key, [])
//     } else {
//         await apiPostGenericDataStoreValue(key, defaultValue, d2Store)
//         console.log('(These errors to /(user)dataStore can be ignored)')
//         return defaultValue
//     }
// }

// export const apiPostDataStoreValue = async (key, value) => {
//     const d2 = await getInstance()
//     return apiPostGenericDataStoreValue(key, value, d2.dataStore)
// }

// export const apiGetDataStoreValue = async (key, defaultValue) => {
//     const d2 = await getInstance()
//     return apiGetGenericDataStoreValue(key, defaultValue, d2.dataStore)
// }
