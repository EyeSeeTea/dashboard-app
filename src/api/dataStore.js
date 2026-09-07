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
