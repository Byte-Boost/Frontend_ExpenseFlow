import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Image, Alert, ScrollView  } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { formatCurrency } from '@/utils/formmatters';
import * as ImagePicker from 'expo-image-picker';
import Refund from '@/services/routes/refund';

import { Avatar, Icon, ListItem } from '@rneui/themed';

const refund = new Refund()

const RefundRequestScreen = () => {

    const [accordions, setAccordions] = useState([
        { 
            id: 1, refundType: '', 
            description: '', 
            receiptUri: null as string | null, 
            totalValue: 0, 
            //isOffLimit: false 
        }
    ]);

    const [expandedAccordionId, setExpandedAccordionId] = useState<number | null>(null);

    const addAccordion = () => {
        setAccordions([...accordions,
            {
                id: accordions.length + 1,
                refundType: '',
                description: '',
                receiptUri: null,
                totalValue: 0,
                //isOffLimit: false,
            }
        ]);
    };

    const deleteAccordion = (id: number) => {
        const updatedAccordions = accordions.filter((accordion) => accordion.id !== id)
            .map((accordion, index) => ({ ...accordion, id: index + 1 }));
        setAccordions(updatedAccordions);

        if (expandedAccordionId === id) {
            setExpandedAccordionId(null);
        }
    };

    const toggleAccordion = (id: number) => {
        const currentAccordion = accordions.find((accordion) => accordion.id === expandedAccordionId);
        if (expandedAccordionId !== null) {
            if (currentAccordion) {
                const { refundType, description, totalValue, receiptUri } = currentAccordion;
                if (!refundType || !description || totalValue <= 0 || !receiptUri) {
                    Alert.alert(
                        "Aviso",
                        "Preencha todos os campos antes de abrir outra Despesa"
                    );
                    return;
                }
            }
        }
        //send info to back
        //code go here
        setExpandedAccordionId(expandedAccordionId === id ? null : id);
    };

    const updateAccordion = (id: number, field: string, value: any) => {
        setAccordions((prevAccordions) =>
            prevAccordions.map((accordion) =>
                accordion.id === id ? { ...accordion, [field]: value } : accordion
            )
        );
    };

    const [refundType, setRefundType] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [receiptUri, setReceiptUri] = useState<string | null>(null);
    const [isOffLimit, setIsOffLimit] = useState(false);
    const [quantityMult, setQuantityMult] = useState(10);
    const limit = 1000


    const handleImageUpload = async (id: number) => {
        // Requests permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão negada', 'Você precisa permitir o acesso à galeria.');
            return;
        }

        // Open the gallery to choose a photo
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            // allowsEditing: true, // Allows image cropping
            quality: 1, // Maximum image quality
        });

        if (!result.canceled) {
            updateAccordion(id, 'receiptUri', result.assets[0].uri); // Updates the specific accordion's receiptUri
        }
    };

    const removeImage = () => {
        setReceiptUri(null)
    }

    //Fix handle submit
    const handleSubmit = async () => {
        if(refundType && amount && receiptUri) {
            if(isOffLimit) {
                if(description) {
                    await refund.postRefund(1, refundType, parseFloat(amount), receiptUri.toString(), description)
                    Alert.alert("Sucesso", `Pedido de reembolso bem sucedido, excedendo o limite máximo de ${limit}.`);
                    setAmount("");
                    setDescription("");
                    setRefundType("");
                    setReceiptUri(null);
                } else {
                    Alert.alert("Aviso", "Você excedeu o limite máximo, portanto a descrição é obrigatória");
                }
            } else {
                await refund.postRefund(1, refundType, parseFloat(amount), receiptUri.toString(), description)
                Alert.alert("Sucesso", `Pedido de reembolso bem sucedido!`);
                setAmount("");
                setDescription("");
                setRefundType("");
                setReceiptUri(null);
            }
        } else {
            Alert.alert("Aviso", "Os seguintes campos são obrigatórios: \n\n - Tipo de Reembolso\n - Valor \n - Recibo")
        }
    };

    return (
        <ScrollView className="p-5 bg-gray-50 h-full">

            <Text className="text-2xl font-bold text-center mb-6">Pedido de Reembolso</Text>

            {accordions.map((accordion) => (
                <ListItem.Accordion
                    key={accordion.id}
                    content={
                        <>
                            <Ionicons name={"cash"} size={30} color={"gray"} />
                            <ListItem.Content>
                                <ListItem.Title>Despesa {accordion.id}</ListItem.Title>
                            </ListItem.Content>
                        </>
                    }
                    isExpanded={expandedAccordionId === accordion.id}
                    onPress={() => toggleAccordion(accordion.id)}
                >

                    {/* Conteúdo do Accordion */}

                    {(!accordion.refundType || !accordion.description || accordion.totalValue <= 0 || !accordion.receiptUri) && (
                                            <View className="bg-red-100 p-3 rounded-lg mb-4">
                                                <Text className="text-red-500 font-bold">
                                                    Preencha todos os campos obrigatórios:
                                                </Text>
                                                {!accordion.refundType && <Text>- Tipo de Reembolso</Text>}
                                                {!accordion.description && <Text>- Descrição</Text>}
                                                {accordion.totalValue <= 0 && <Text>- Valor Total</Text>}
                                                {!accordion.receiptUri && <Text>- Recibo</Text>}
                                            </View>
                        )}                     

                    {/*Change Type*/}
                    <Text className="mb-2 text-lg font-bold">Tipo de Despesa</Text>
                    <View className="flex-row justify-between mb-4">
                        <TouchableOpacity
                            onPress={() => updateAccordion(accordion.id, 'refundType', 'value')}
                            className={`flex-1 flex-row items-center p-2 rounded-lg border mr-2 ${
                                accordion.refundType === 'value' ? 'border-blue-500' : 'border-gray-300'
                            }`}
                        >
                            <Ionicons name="pricetag" size={20} color={accordion.refundType === 'value' ? 'blue' : 'gray'} />
                            <Text className={`ml-2 ${accordion.refundType === 'value' ? 'text-blue-500' : 'text-gray-700'}`}>
                                Valor
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => updateAccordion(accordion.id, 'refundType', 'quantity')}
                            className={`flex-1 flex-row items-center p-2 rounded-lg border ml-2 ${
                                accordion.refundType === 'quantity' ? 'border-blue-500' : 'border-gray-300'
                            }`}
                        >
                            <Ionicons name="car-sport" size={20} color={accordion.refundType === 'quantity' ? 'blue' : 'gray'} />
                            <Text className={`ml-2 ${accordion.refundType === 'quantity' ? 'text-blue-500' : 'text-gray-700'}`}>
                                Quantidade
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="mb-2 text-lg font-bold">Descrição</Text>
                    <View className="flex-row items-center bg-white p-2 rounded-lg border border-[#ccc] mb-4">
                        <Ionicons name="pencil" size={20} color="#6B7280" />
                        <TextInput
                            value={accordion.description}
                            onChangeText={(text) => updateAccordion(accordion.id, 'description', text)}
                            placeholder="Descreva a razão da despesa"
                            multiline
                            className="ml-2 w-full h-24 text-left"
                        />
                    </View>

                    <Text className="mb-2 text-lg font-bold">Valor</Text>
                        {isOffLimit ? <Text className="text-lg pb-2 font-bold text-[#ff4a11]"> Você está acima do limite de {limit} </Text> : <></>}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, borderColor: '#ccc', marginBottom: 20 }}>
                        <MaterialIcons name={accordion.refundType == 'value' ?  'attach-money' : 'add-box'} size={20} color="#6B7280" />
                        <TextInput
                            value={accordion.totalValue.toString()}
                            onChangeText={(text) => updateAccordion(accordion.id, 'totalValue', text)}
                            placeholder="Insira o Valor da Despesa"
                            keyboardType="numeric"
                            style={{ marginLeft: 10, flex: 1 }}
                        />
                        {accordion.refundType === 'quantity' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                <Text style={{ color: '#6B7280', fontSize: 14 }}>
                                    <FontAwesome name="times" size={16} color="#6B7280" /> {quantityMult}
                                </Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={() => handleImageUpload(accordion.id)}
                        className="bg-blue-500 p-3 rounded-lg flex-row items-center mb-6"
                    >
                        <Ionicons name="image-outline" size={20} color="white" />
                        <Text className="text-white ml-2">Adicionar Recibo</Text>
                    </TouchableOpacity>

                    {accordion.receiptUri && (
                        <View className="mb-6">
                            <Text className="text-lg mb-2">Imagem recebida</Text>
                            <MaterialIcons name={refundType == 'value' ?  'close' : 'close'} size={20} color="#FF0000" onPress={removeImage}/>
                            <Image
                                source={{ uri: accordion.receiptUri || undefined }}
                                style={{ width: 150, height: 150, borderRadius: 8 }}
                            />
                        </View>
                    )}

                        <View className="bg-[#f0f0f0] p-4 rounded-lg mb-6">
                            <Text className="text-sm font-bold text-[#6B7280] pb-2">VALOR TOTAL</Text>
                            <Text className="text-4xl font-bold ">{formatCurrency(accordion.totalValue)}</Text>
                        </View>




                    {/* Delete Accordion */}
                    <TouchableOpacity
                        className="bg-red-500 mb-10 p-2 rounded-lg mt-4"
                        onPress={() => deleteAccordion(accordion.id)}
                    >
                        <Text className="text-white text-center font-bold">Deletar Despesa</Text>
                    </TouchableOpacity>
                
                </ListItem.Accordion>
            ))}

            {/* Add Accordion */}
            <TouchableOpacity
                className={`w-full p-3 mb-10 rounded-lg ${
                    expandedAccordionId !== null &&
                    (!accordions.find((accordion) => accordion.id === expandedAccordionId)?.refundType ||
                    !accordions.find((accordion) => accordion.id === expandedAccordionId)?.description ||
                    accordions.find((accordion) => accordion.id === expandedAccordionId)?.totalValue <= 0 ||
                    !accordions.find((accordion) => accordion.id === expandedAccordionId)?.receiptUri)
                        ? 'bg-gray-300'
                        : 'bg-blue-500'
                    }`
                }
                onPress={addAccordion}
                disabled={
                    expandedAccordionId !== null &&
                    (!accordions.find((accordion) => accordion.id === expandedAccordionId)?.refundType ||
                    !accordions.find((accordion) => accordion.id === expandedAccordionId)?.description ||
                    accordions.find((accordion) => accordion.id === expandedAccordionId)?.totalValue <= 0 ||
                    !accordions.find((accordion) => accordion.id === expandedAccordionId)?.receiptUri)
                }
            >
                <Text
                    className={`text-center font-bold ${
                        expandedAccordionId !== null &&
                        (!accordions.find((accordion) => accordion.id === expandedAccordionId)?.refundType ||
                        !accordions.find((accordion) => accordion.id === expandedAccordionId)?.description ||
                        accordions.find((accordion) => accordion.id === expandedAccordionId)?.totalValue <= 0 ||
                        !accordions.find((accordion) => accordion.id === expandedAccordionId)?.receiptUri)
                            ? 'text-gray-500'
                            : 'text-white'
                        }`
                    }
                >
                    Adicionar Despesa
                </Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
                onPress={handleSubmit}
                disabled={
                    expandedAccordionId !== null &&
                    (!accordions.find((accordion) => accordion.id === expandedAccordionId)?.refundType ||
                    !accordions.find((accordion) => accordion.id === expandedAccordionId)?.description ||
                    accordions.find((accordion) => accordion.id === expandedAccordionId)?.totalValue <= 0 ||
                    !accordions.find((accordion) => accordion.id === expandedAccordionId)?.receiptUri)
                }
                className={`w-full p-3 mb-10 rounded-lg ${
                    expandedAccordionId !== null &&
                    (!accordions.find((accordion) => accordion.id === expandedAccordionId)?.refundType ||
                    !accordions.find((accordion) => accordion.id === expandedAccordionId)?.description ||
                    accordions.find((accordion) => accordion.id === expandedAccordionId)?.totalValue <= 0 ||
                    !accordions.find((accordion) => accordion.id === expandedAccordionId)?.receiptUri)
                        ? 'bg-gray-300'
                        : 'bg-green-500'
                    }`
                }
            >
                <Text 
                    className={`text-center font-bold ${
                        expandedAccordionId !== null &&
                        (!accordions.find((accordion) => accordion.id === expandedAccordionId)?.refundType ||
                        !accordions.find((accordion) => accordion.id === expandedAccordionId)?.description ||
                        accordions.find((accordion) => accordion.id === expandedAccordionId)?.totalValue <= 0 ||
                        !accordions.find((accordion) => accordion.id === expandedAccordionId)?.receiptUri)
                            ? 'text-gray-500'
                            : 'text-white'
                        }`
                    }
                >
                    Enviar Pedido de Reembolso
                </Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

export default RefundRequestScreen;
