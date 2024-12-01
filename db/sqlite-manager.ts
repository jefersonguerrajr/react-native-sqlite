import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | undefined = undefined

export const openDatabase = async (name: string = 'database_local.db') => {
    database = await SQLite.openDatabaseAsync(name)
    return database
}

export const closeDatabase = async () => {
    if (database) {
        await database.closeAsync()
    }
}

export const getDatabase = () => {
    if (!database) {
        throw new Error("Banco de dados fechado");
    }
    return database
}