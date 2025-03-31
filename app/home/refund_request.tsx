import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView  } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { formatCurrency } from '@/utils/formmatters';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

import { ListItem } from '@rneui/themed';
import RefundService from '@/services/refundService';
import Refund from '@/utils/refund';

const _refundService = new RefundService();

interface Accordion {
    id: number;
    refundType: string;
    description: string;
    attachment: string | null;
    totalValue: number;
    isSaved: false;
}

const RefundRequestScreen = () => {
    const [refund, setRefund] = useState<Refund | null>(null);
    const createNewRefund = async ()=>{
        if (isFirstAction) {
            let res = await _refundService.createRefund();
            setRefund(new Refund(res.refundId));
            setIsFirstAction(false);
        }                         
        addAccordion();
    }

    const [accordions, setAccordions] = useState<Accordion[]>([]);
    const [expandedAccordionId, setExpandedAccordionId] = useState<number | null>(null);
    const [refundType, setRefundType] = useState('');
   
    const [quantityMult, setQuantityMult] = useState(10);
    const limit = 1000
    const [isFirstAction, setIsFirstAction] = useState(true);

    const accordionIsInvalid = (
        !accordions.find((accordion) => accordion.id === expandedAccordionId)?.refundType ||
        !(accordions.find((accordion) => accordion.id === expandedAccordionId)?.totalValue ?? 0 <= 0) ||
        !accordions.find((accordion) => accordion.id === expandedAccordionId)?.attachment
    );

    const isSubmitDisabled =
        isFirstAction ||
        expandedAccordionId !== null && accordionIsInvalid ||
        accordions.some((accordion) => accordion.isSaved == false);

    const addAccordion = () => {
        const newAccordion: Accordion = {
            id: accordions.length + 1,
            refundType: '',
            description: '',
            attachment: null,
            totalValue: 0,
            isSaved: false,
        };
        setAccordions([...accordions, newAccordion]);
        setExpandedAccordionId(newAccordion.id);
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
                const { refundType, totalValue, attachment } = currentAccordion;
                if (!refundType || totalValue <= 0 || !attachment) {
                    Alert.alert(
                        "Aviso",
                        "Preencha todos os campos antes de abrir outra Despesa"
                    );
                    return;
                }
            }
        }
        setExpandedAccordionId(expandedAccordionId === id ? null : id);
    };

    const updateAccordion = (id: number, field: string, value: any) => {
        setAccordions((prevAccordions) =>
            prevAccordions.map((accordion) =>
                accordion.id === id ? { ...accordion, [field]: value } : accordion
            )
        );
    };

    const saveAccordion = async (id: number) => {
        const accordion = accordions.find((accordion) => accordion.id === id);
        if (!accordion) {
            Alert.alert("Erro", "Accordion não encontrado.");
            return;
        }

        const { refundType, totalValue, attachment , description} = accordion;

        if (refund == null || !refundType || totalValue <= 0 || !attachment || (totalValue > limit && !description)) {
            Alert.alert("Aviso", "Preencha todos os campos obrigatórios antes de salvar.");
            return;
        }
        try {
             let base64attachment = await FileSystem.readAsStringAsync(attachment, { encoding: FileSystem.EncodingType.Base64 });
            let expenseId = await _refundService.createExpense(
                refund.id,
                refundType, 
                (totalValue * (accordion.refundType === 'quantity' ? quantityMult : 1)),
                accordion.description, 
                base64attachment
            );
            updateAccordion(id, 'isSaved', true);
            updateAccordion(id, 'expenseId', expenseId);
        } catch (err){
            console.log(err);
            Alert.alert("Erro", "Erro ao salvar a despesa.");
        }
    };

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
            updateAccordion(id, 'attachment', result.assets[0].uri); // Updates the specific accordion's attachment
        }
    };

    const removeImage = () => {
        updateAccordion(expandedAccordionId!, 'attachment', null); 
    }

    const handleSubmit = async () => {
        if (isFirstAction || refund == null) {
            Alert.alert("Erro", "Crie uma nova despesa antes de enviar o pedido.");
            return;
        }
        await _refundService.closeRefund(refund.id).then(()=>{
            setAccordions([]);
            setExpandedAccordionId(null);
            setIsFirstAction(true);
        });
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

                    {(!accordion.refundType || accordion.totalValue <= 0 || !accordion.attachment || (!accordion.description && accordion.totalValue > limit )) && (
                        <View className="bg-red-100 p-3 rounded-lg mb-4">
                            <Text className="text-red-500 font-bold">
                                Preencha todos os campos obrigatórios:
                            </Text>
                            {!accordion.refundType && <Text>- Tipo de Reembolso</Text>}
                            {accordion.totalValue <= 0 && <Text>- Valor </Text>}
                            {(!accordion.description && accordion.totalValue > limit )&& <Text>- Descrição</Text>}
                            {!accordion.attachment && <Text>- Recibo</Text>}
                        </View>
                    )}  

                    {(accordion.isSaved) && (
                        <View className="bg-green-100 p-3 rounded-lg mb-4">
                            <Text className="text-green-500 font-bold">Despesa Salva com Sucesso!</Text>
                        </View>
                            )}                   

                    {/*Change Type*/}
                    <Text className="mb-2 text-lg font-bold">Tipo de Despesa</Text>
                    <View className="flex-row justify-between mb-4">
                        <TouchableOpacity
                            onPress={() => {
                                if (accordion.isSaved) {
                                    return;
                                }
                                updateAccordion(accordion.id, 'refundType', 'value');
                            }}
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
                            onPress={() => {
                                if (accordion.isSaved) {
                                    return;
                                }
                                updateAccordion(accordion.id, 'refundType', 'quantity')
                            }}
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
                            editable={!accordion.isSaved}
                        />
                    </View>

                    <Text className="mb-2 text-lg font-bold">Valor</Text>
                        {accordion.totalValue > limit ? <Text className="text-md pb-2 font-bold text-[#e3be22]">  Você está acima do limite de {limit}</Text> : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, borderColor: '#ccc', marginBottom: 20 }}>
                        <MaterialIcons name={accordion.refundType == 'value' ?  'attach-money' : 'add-box'} size={20} color="#6B7280" />
                        <TextInput
                            value={accordion.totalValue.toString()}
                            onChangeText={(text) => updateAccordion(accordion.id, 'totalValue', text)}
                            placeholder="Insira o Valor da Despesa"
                            keyboardType="numeric"
                            style={{ marginLeft: 10, flex: 1 }}
                            editable={!accordion.isSaved}
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

                    {accordion.attachment && (
                        <View className="mb-6">
                            <MaterialIcons name={refundType == 'value' ?  'close' : 'close'} size={20} color="#FF0000" onPress={removeImage}/>
                            <Image
                                source={{ uri: accordion.attachment || undefined }}
                                style={{ width: 150, height: 150, borderRadius: 8 }}
                            />
                        </View>
                    )}

                        <View className="bg-[#f0f0f0] p-4 rounded-lg mb-6">
                            <Text className="text-sm font-bold text-[#6B7280] pb-2">VALOR TOTAL</Text>
                            <Text className="text-4xl font-bold ">{formatCurrency(accordion.totalValue * (accordion.refundType === 'quantity' ? quantityMult: 1 ))}</Text>
                        </View>

                    {/* Save Accordion | Send to Back  */}
                    <TouchableOpacity
                        className={`w-full p-3 mb-10 rounded-lg ${
                            accordion.isSaved || (!accordion.refundType || accordion.totalValue <= 0 || !accordion.attachment || (!accordion.description && accordion.totalValue > limit ))
                                ? 'bg-gray-300'
                                : 'bg-green-500'
                        }`}
                        onPress={() => saveAccordion(accordion.id)}
                        disabled={accordion.isSaved || (!accordion.refundType || accordion.totalValue <= 0 || !accordion.attachment || (!accordion.description && accordion.totalValue > limit ))}
                    >
                        <Text
                            className={`text-center font-bold ${
                                accordion.isSaved || (!accordion.refundType || accordion.totalValue <= 0 || !accordion.attachment || (!accordion.description && accordion.totalValue > limit ))
                                    ? 'text-gray-500'
                                    : 'text-white'
                            }`}
                        >Salvar Despesa</Text>
                    </TouchableOpacity>
                    

                    {/* Delete Accordion */}
                    {/* <TouchableOpacity
                        className={`w-full p-3 mb-10 rounded-lg ${
                            accordion.isSaved
                                ? 'bg-gray-300'
                                : 'bg-red-500'
                        }`}
                        onPress={() => deleteAccordion(accordion.id)}
                        disabled={accordion.isSaved}
                    >
                        <Text 
                            className={`text-center font-bold ${
                                accordion.isSaved
                                    ? 'text-gray-500'
                                    : 'text-white'
                            }`}
                        >Deletar Despesa</Text>
                    </TouchableOpacity> */}
                
                </ListItem.Accordion>
            ))}

            {/* Add Accordion */}
            <TouchableOpacity
                className={`w-full p-3 mb-10 rounded-lg ${
                    expandedAccordionId !== null && accordionIsInvalid
                        ? 'bg-gray-300'
                        : 'bg-blue-500'
                }`}
                onPress={createNewRefund}
                disabled={
                    accordions.some((accordion) => accordion.isSaved == false)
                }
            >
                <Text
                    className={`text-center font-bold ${
                        expandedAccordionId !== null && accordionIsInvalid
                            ? 'text-gray-500'
                            : 'text-white'
                    }`}
                >
                    {isFirstAction ? "Começar Reembolso" : "Adicionar Despesa"}
                </Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
                className={`w-full p-3 mb-10 rounded-lg ${
                    isSubmitDisabled
                        ? 'bg-gray-300'
                        : 'bg-green-500'
                    }`
                }
            >
                <Text 
                    className={`text-center font-bold ${
                        isSubmitDisabled
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
