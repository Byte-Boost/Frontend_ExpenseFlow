// REFUND LIST SCREEN
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import RefundService from "@/services/refundService";
import { formatCurrency } from '@/utils/formmatters';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from "@expo/vector-icons";

const _refundService = new RefundService();

export default function RefundList() {
    const currentDate = new Date();

    const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
    const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
    const [refunds, setRefunds] = useState<any[]>([]);

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
                const response = await _refundService.getRefunds(displayMonth.toString(), displayYear.toString());
                console.log("Refunds:", response);

                setRefunds(response);
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

    const colors = {
        'in-process': 'text-cyan-500',
        'rejected': 'text-red-500',
        'approved': 'text-green-500',
    };

    //FIX THIS TO USE RIGHT STUFF
    const translation ={
        'in-process': 'Em processamento',
        'rejected': 'Rejeitado',
        'approved': 'Aprovado',
    }

    interface RefundItem {
        id: string;
        status: 'in-process' | 'rejected' | 'approved';
        totalValue: number;
        date: string;
    }
    
    const renderItem = ({ item }: { item: RefundItem }) => (
        <TouchableOpacity className="p-4 bg-white mb-2 rounded shadow">
            <Text className="text-gray-600">Status: <Text className={` ${colors[item.status]}`}> {(translation[item.status]).toLocaleUpperCase()}</Text></Text>
            <Text className="text-lg font-semibold">Quantidade: {formatCurrency(item.totalValue)}</Text>
            <Text className="text-gray-600">Data: {(new Date(item.date)).toLocaleString()}</Text>
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
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 pb-5 mb-4">
                <Ionicons name="filter" size={20} color="black" className="mr-2" />
                <View className="flex-1">
                    <RNPickerSelect
                    onValueChange={(value) => _refundService.getRefundByStatus(value)}
                    placeholder={{ label: 'Selecione um status', value: null, color: '#9EA0A4' }}
                    items={[
                        { label: 'Em processo', value: 'in-process' },
                        { label: 'Aprovado', value: 'approved' },
                        { label: 'Rejeitado', value: 'rejected' },
                    ]}
                    />
                </View>
            </View>
            <FlatList
                data={refunds.filter(refund => refund.date.startsWith(`${displayYear}-${displayMonth.toString().padStart(2, '0')}`))}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />

        </View>
    );
}
