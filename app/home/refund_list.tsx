// ACCOUNT SETTINGS SCREEN
import { FlatList, Button, Text, TouchableOpacity, View } from "react-native";
import * as SecureStore from 'expo-secure-store';
import { useRouter } from "expo-router";
import React from "react";


export default function RefundList() {
    const router = useRouter();
    const refunds = [
        { id: '1', name: 'Refund 1', amount: 100, date: '2021-09-01', status: 'pending' },
        { id: '2', name: 'Refund 2', amount: 200 },
        { id: '3', name: 'Refund 3', amount: 300 },
        { id: '4', name: 'Refund 4', amount: 400 },
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity className="p-4 bg-white mb-2 rounded shadow" onPress={() => router.push(`/refund/${item.id}`)}>
            <Text className="text-gray-600">Data: {item.date}</Text>
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-600">Quantidade: ${item.amount}</Text>
            <Text className="text-gray-600">Quantidade: {item.status}</Text>
        </TouchableOpacity>
    );
    return (
        <View className="p-5 bg-gray-50 h-full">
            <Text className="text-2xl font-bold text-center mb-6">Lista de Rembolsos</Text>

            <FlatList
                data={refunds}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
}
