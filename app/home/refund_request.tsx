import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { formatCurrency } from '@/utils/formmatters';

const RefundRequestScreen = () => {
    const [refundType, setRefundType] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [receiptUri, setReceiptUri] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [totalValue, setTotalValue] = useState(0);
    // Placeholder value change when we set groups and etc.
    const [quantityMult, setQuantityMult] = useState(10);

    const handleImageUpload = () => {
        // Handle image upload here
    };

    useEffect(() => {
        if (amount) {
            const quantity = parseFloat(amount);
            const placeholderValue = quantityMult;
            if (refundType === 'quantity') {
                const total = quantity * placeholderValue;
                setTotalValue(total);
            }
            else {
                setTotalValue(parseFloat(amount) || 0)
            }
        } else {
            setTotalValue(parseFloat(amount) || 0);
        }
    }, [refundType, amount]);

    const handleSubmit = () => {
        console.log({
            refundType,
            description,
            amount,
            receiptUri,
            totalValue,
        });
    };

    return (
        <View className="p-5 bg-gray-50 h-full">
            <Text className="text-2xl font-bold text-center mb-6">Pedido de Reembolso</Text>

            <Text className="mb-2 text-lg font-bold">Tipo de Reembolso</Text>
            <DropDownPicker
                open={dropdownOpen}
                value={refundType}
                items={[
                    {
                        label: 'Valor',
                        value: 'value',
                        icon: () => <Ionicons name="pricetag" size={20} color="gray" style={{ marginRight: 10 }} />,
                    },
                    {
                        label: 'Quantidade',
                        value: 'quantity',
                        icon: () => <Ionicons name="car-sport" size={20} color="gray" style={{ marginRight: 10 }} />,
                    },
                ]}
                setOpen={setDropdownOpen}
                setValue={setRefundType}
                placeholder="Escolha o Tipo de Reembolso"
                style={{ borderColor: '#ccc' }}
                containerStyle={{ marginBottom: 20 }}
                placeholderStyle={{
                    fontSize: 16,
                    fontWeight: '400',
                    marginLeft: 10,
                }}
            />

            <Text className="mb-2 text-lg font-bold">Descrição</Text>
            <View className="flex-row items-center bg-white p-2 rounded-lg border border-[#ccc] mb-4">
                <Ionicons name="pencil" size={20} color="#6B7280" />
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Descreva a razão do reembolso"
                    multiline
                    className="ml-2 w-full h-24 text-left"
                />
            </View>

            <Text className="mb-2 text-lg font-bold">Valor</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, borderColor: '#ccc', marginBottom: 20 }}>
                <MaterialIcons name={refundType == 'value' ?  'attach-money' : 'add-box'} size={20} color="#6B7280" />
                <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Insira o Valor do Reembolso"
                    keyboardType="numeric"
                    style={{ marginLeft: 10, flex: 1 }}
                />
                {refundType === 'quantity' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                        <Text style={{ color: '#6B7280', fontSize: 14 }}>
                            <FontAwesome name="times" size={16} color="#6B7280" /> {quantityMult}
                        </Text>
                    </View>
                )}
            </View>

            <TouchableOpacity
                onPress={handleImageUpload}
                className="bg-blue-500 p-3 rounded-lg flex-row items-center mb-6"
            >
                <Ionicons name="image-outline" size={20} color="white" />
                <Text className="text-white ml-2">Adicionar Recibo</Text>
            </TouchableOpacity>

            {receiptUri && (
                <View className="mb-6">
                    <Text className="text-lg mb-2">Recibo Enviado</Text>
                    <Image
                        source={{ uri: receiptUri }}
                        style={{ width: 150, height: 150, borderRadius: 8 }}
                    />
                </View>
            )}

                <View className="bg-[#f0f0f0] p-4 rounded-lg mb-6">
                    <Text className="text-sm font-bold text-[#6B7280] pb-2">VALOR TOTAL</Text>
                    <Text className="text-4xl font-bold ">{formatCurrency(totalValue)}</Text>
                </View>

            <TouchableOpacity
                className="w-full p-3 rounded-lg bg-green-500"
                onPress={handleSubmit}
            >
                <Text className="text-white text-center font-bold">Enviar Pedido de Reembolso</Text>
            </TouchableOpacity>
        </View>
    );
};

export default RefundRequestScreen;
