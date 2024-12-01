import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { Text, StyleSheet, View, Button, SafeAreaView, Alert, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import * as SQLite from 'expo-sqlite';
import { getDatabase, openDatabase } from '@/db/sqlite-manager';

interface IUser {
  codigo: string
  nome: string
  email: string
  senha: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [usuarios, setUsuarios] = useState<IUser[]>([]);

  const [testaValor, setTestaValor] = useState<any>()

  const save = async () => {
    try {
      if (!name || !email) {
        throw new Error("Preencha os campos corretamente.");
      }
      const db = getDatabase()
      await db.runAsync('INSERT INTO usuario (nome, email) VALUES (?,?)', name, email);
      const data = await db.getAllAsync<IUser>('SELECT codigo, nome, email FROM usuario');
      setUsuarios(data);
    } catch (error) {
      Alert.alert('Error', (error as Error).message)
    }
  };

  const clearTable = () => {
    try {
      const db = getDatabase()
      db.execAsync(`DELETE FROM usuario`)
      setUsuarios([]);
    } catch (error) {
      Alert.alert('Error', (error as Error).message)
    }
  }

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const aposCarregar = async () => {
    const db = await openDatabase()
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS usuario(codigo INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, email TEXT NOT NULL);
    `);
    const data = await db.getAllAsync<IUser>('SELECT codigo, nome, email FROM usuario');
    setUsuarios(data);
    await SplashScreen.hideAsync();
  }

  useEffect(() => {
    if (loaded) {
      aposCarregar()
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <View style={styles.container}>
        <Text style={styles.title}>Formulário de Exemplo</Text>
        <Text style={styles.label}>Nome:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={{ gap: 10 }}>
          <Button title="Salvar" onPress={save} />
          <Button title="Limpar" onPress={clearTable} />

        </View>


        <Text style={{ marginTop: 20 }}>Usuarios Cadastrados:</Text>
        <ScrollView>
          {usuarios && usuarios.map(usuario => (
            <Text key={usuario.codigo}>{`${usuario.codigo} ${usuario.nome} ${usuario.email}`}</Text>
          ))}
        </ScrollView>
      </View>

    </GestureHandlerRootView>

  );
}
