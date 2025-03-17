// REFUND LIST SCREEN
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";


export default function RefundList() {
    const currentDate = new Date();

    const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
    const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
    const [refunds, setRefunds] = useState([]);

    if (displayMonth < 1) {
        setDisplayMonth(12);
        setDisplayYear(displayYear - 1);
    } else if (displayMonth > 12) {
        setDisplayMonth(1);
        setDisplayYear(displayYear + 1);
    }
    
    /*
    const refunds = [
        { id: '1', name: 'Refund 1', amount: 100, date: '2025-09-01', status: 'pending' },
        { id: '2', name: 'Refund 2', amount: 200, date: '2025-10-10', status: 'pending' },
        { id: '3', name: 'Refund 2', amount: 200, date: '2025-03-12', status: 'pending' },
        { id: '4', name: 'Refund 2', amount: 200, date: '2025-03-11', status: 'pending' },
        { id: '5', name: 'Refund 3', amount: 300, date: '2025-07-15', status: 'pending' },
        { id: '6', name: 'Refund 3', amount: 300, date: '2025-12-15', status: 'pending' },
        { id: '7', name: 'Refund 3', amount: 300, date: '2025-01-15', status: 'pending' },
        { id: '8', name: 'Refund 3', amount: 300, date: '2025-02-15', status: 'pending' },
        { id: '9', name: 'Refund 3', amount: 300, date: '2025-04-15', status: 'pending' },
        { id: '10', name: 'Refund 3', amount: 300, date: '2025-05-15', status: 'pending' },
    ];*/

    const router = useRouter();

    useEffect(() => {
        const fetchRefunds = async () => {
            try {
                const response = await fetch(`http://localhost:3200/refunds?periodStart=${displayYear}-${displayMonth.toString().padStart(2, '0')}-01&periodEnd=${displayYear}-${displayMonth.toString().padStart(2, '0')}-31`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRefunds(data);
            } catch (error) {
                console.error("Error fetching refunds:", error);
            }
        };

        fetchRefunds();
    }, [displayMonth, displayYear]);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity className="p-4 bg-white mb-2 rounded shadow" onPress={() => router.push(`/refund/${item.id}`)}>
            <Text className="text-gray-600">Data: {item.date}</Text>
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-600">Quantidade: ${item.amount}</Text>
            <Text className="text-gray-600">Status: {item.status}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="p-5 bg-gray-50 h-full">
            <Text className="text-2xl font-bold text-center mb-6">Lista de Reembolsos</Text>
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => { setDisplayMonth(displayMonth - 1); }}>
                    <Text style={{ fontSize: 24 }}>{"<"}</Text>
                </TouchableOpacity>
                <View className="flex-column items-center">
                    <Text className="text-xl font-bold">{months[displayMonth - 1]}</Text>
                    <Text className="text-gray-600">{displayYear}</Text>
                </View>
                <TouchableOpacity onPress={() => { setDisplayMonth(displayMonth + 1); }}>
                    <Text style={{ fontSize: 24 }}>{">"}</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={refunds.filter(refund => refund.date.startsWith(`${displayYear}-${displayMonth.toString().padStart(2, '0')}`))}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
}
