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
    const [accordions, setAccordions] = useState<Accordion[]>([]);
    const [expandedAccordionId, setExpandedAccordionId] = useState<number | null>(null);
    const [isFirstAction, setIsFirstAction] = useState(true);

    const limit = 1000
    const [quantityMult, setQuantityMult] = useState(10);

    const isAccordionComplete = (accordionId: number | null): boolean => {
        if (accordionId === null) return true; // No accordion is expanded, so technically complete for adding new
        const accordion = accordions.find((acc) => acc.id === accordionId);
        if (!accordion) return true; // Should not happen
        return (
            !!accordion.refundType &&
            accordion.totalValue > 0 &&
            !!accordion.attachment &&
            (accordion.totalValue <= limit || !!accordion.description) // Description required only if over limit
        );
    };

    const isAnyAccordionUnsaved = accordions.some((accordion) => !accordion.isSaved);
    const isCurrentAccordionIncomplete = expandedAccordionId !== null && !isAccordionComplete(expandedAccordionId);

    const isAddExpenseDisabled = isAnyAccordionUnsaved || isCurrentAccordionIncomplete;
    const isSubmitDisabled = isFirstAction || isAnyAccordionUnsaved || isCurrentAccordionIncomplete;
    const isCancelDisabled = isFirstAction; // Disable cancel if no refund has been started

    const createNewRefund = async ()=> {
        if (isFirstAction) {
            let res = await _refundService.createRefund();
            setRefund(new Refund(res.refundId));
            setIsFirstAction(false);
        }                         
        addAccordion();
    }

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
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
        Alert.alert(
            'Permissão necessária',
            'Você precisa permitir o acesso à câmera e à galeria para adicionar um recibo.'
        );
        return;
    }

    Alert.alert(
        'Selecionar Imagem',
        'Como você deseja adicionar o recibo?',
        [
            {
                text: 'Cancelar',
                style: 'cancel',
            },
            {
                text: 'Galeria',
                onPress: async () => {
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 1,
                    });

                    if (!result.canceled) {
                        updateAccordion(id, 'attachment', result.assets[0].uri);
                    }
                },
            },
            {
                text: 'Câmera',
                onPress: async () => {
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        quality: 1,
                    });

                    if (!result.canceled) {
                        updateAccordion(id, 'attachment', result.assets[0].uri);
                    }
                },
            },
        ]
    );
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

    const resetState = () => {
        setAccordions([]);
        setExpandedAccordionId(null);
        setIsFirstAction(true);
        setRefund(null);
        // Reset any other relevant state if needed
    };

    const handleCancel = () => {
        if (!refund || !refund.id) {
            // Should not happen if button is correctly disabled, but good practice
            resetState(); // Reset state even if refund ID is missing
            return;
        }

        Alert.alert(
            "Confirmar Cancelamento",
            "Tem certeza que deseja cancelar este pedido de reembolso? Todas as despesas não salvas serão perdidas.",
            [
                {
                    text: "Não",
                    style: "cancel",
                },
                {
                    text: "Sim",
                    onPress: async () => {
                        try {
                            await _refundService.deleteRefund(refund.id);
                            resetState();
                            Alert.alert("Cancelado", "Pedido de reembolso cancelado com sucesso.");
                        } catch (error: any) {
                            console.error("Failed to delete refund:", error);
                            // Handle specific errors if needed, e.g., based on status code
                            if (error.response && error.response.status === 403) {
                                Alert.alert("Erro", "Não é possível cancelar um reembolso que já foi processado.");
                                // Optionally reset state even on error, depending on desired UX
                                // resetState();
                            } else {
                                Alert.alert("Erro", "Não foi possível cancelar o pedido de reembolso. Tente novamente.");
                            }
                        }
                    },
                    style: "destructive", // iOS style for destructive actions
                },
            ]
        );
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
                            {/* Add a visual indicator if saved */}
                            {accordion.isSaved && <Ionicons name="checkmark-circle" size={24} color="green" style={{ marginLeft: 10 }} />}
                        </>
                    }
                    isExpanded={expandedAccordionId === accordion.id}
                    onPress={() => {
                        // Prevent toggling if current accordion is incomplete and trying to collapse
                        if (expandedAccordionId === accordion.id && !isAccordionComplete(accordion.id)) {
                             Alert.alert(
                                "Aviso",
                                "Preencha todos os campos obrigatórios da despesa atual antes de fechar."
                            );
                            return;
                        }
                         // Prevent toggling if another accordion is incomplete and trying to expand a new one
                        if (expandedAccordionId !== null && expandedAccordionId !== accordion.id && !isAccordionComplete(expandedAccordionId)) {
                             Alert.alert(
                                "Aviso",
                                "Preencha todos os campos obrigatórios da despesa aberta antes de mudar para outra."
                            );
                            return;
                        }
                        toggleAccordion(accordion.id);
                    }}
                >

                    {/* Validation Message */}
                    {(expandedAccordionId === accordion.id && !isAccordionComplete(accordion.id)) && (
                        <View className="bg-red-100 p-3 rounded-lg mb-4 border border-red-300">
                            <Text className="text-red-600 font-bold mb-1">
                                Campos obrigatórios pendentes:
                            </Text>
                            {!accordion.refundType && <Text className="text-red-500">- Tipo de Despesa</Text>}
                            {accordion.totalValue <= 0 && <Text className="text-red-500">- Valor (deve ser maior que zero)</Text>}
                            {(accordion.totalValue > limit && !accordion.description) && <Text className="text-red-500">- Descrição (obrigatória para valores acima de {formatCurrency(limit)})</Text>}
                            {!accordion.attachment && <Text className="text-red-500">- Recibo</Text>}
                        </View>
                    )}

                    {(accordion.isSaved) && (
                        <View className="bg-green-100 p-3 rounded-lg mb-4 border border-green-300">
                            <Text className="text-green-600 font-bold">Despesa Salva com Sucesso!</Text>
                        </View>
                    )}

                    {/* Change Type */}
                    <Text className="mb-2 text-lg font-semibold text-gray-700">Tipo de Despesa *</Text>
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

                     <Text className={`mb-2 text-lg font-semibold text-gray-700 ${accordion.totalValue > limit ? 'text-yellow-600' : 'text-gray-700'}`}>
                        Descrição {accordion.totalValue > limit ? '*' : ''}
                    </Text>
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

                    <Text className="mb-2 text-lg font-semibold text-gray-700">Valor *</Text>
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

                    <Text className="mb-2 text-lg font-semibold text-gray-700">Recibo *</Text>
                     <TouchableOpacity
                        onPress={() => handleImageUpload(accordion.id)}
                        disabled={accordion.isSaved}
                        className={`p-3 rounded-lg flex-row items-center justify-center mb-4 ${accordion.isSaved ? 'bg-gray-300' : 'bg-blue-500'}`}
                    >
                        <Ionicons name="image-outline" size={20} color={accordion.isSaved ? 'gray' : "white"} />
                        <Text className={`ml-2 ${accordion.isSaved ? 'text-gray-500' : 'text-white font-semibold'}`}>
                            {accordion.attachment ? "Alterar Recibo" : "Adicionar Recibo"}
                        </Text>
                    </TouchableOpacity>

                    {accordion.attachment && (
                        <View className="mb-4 relative self-start">
                             <Image
                                source={{ uri: accordion.attachment || undefined }}
                                style={{ width: 150, height: 150, borderRadius: 8 }}
                            />
                            {!accordion.isSaved && (
                                <TouchableOpacity
                                    onPress={removeImage}
                                    style={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white', borderRadius: 15, padding: 2 }}
                                >
                                    <MaterialIcons name={'close'} size={20} color="#FF6347" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <View className="bg-[#f0f0f0] p-4 rounded-lg mb-6">
                        <Text className="text-sm font-bold text-[#6B7280] pb-2">VALOR TOTAL</Text>
                        <Text className="text-4xl font-bold ">{formatCurrency(accordion.totalValue * (accordion.refundType === 'quantity' ? quantityMult: 1 ))}</Text>
                    </View>

                    {/* Save Accordion | Send to Back */}
                     <TouchableOpacity
                        className={`w-full p-3 mb-4 rounded-lg ${
                            accordion.isSaved || !isAccordionComplete(accordion.id)
                                ? 'bg-gray-300'
                                : 'bg-green-500'
                        }`}
                        onPress={() => saveAccordion(accordion.id)}
                        disabled={accordion.isSaved || !isAccordionComplete(accordion.id)}
                    >
                        <Text
                            className={`text-center font-bold ${
                                accordion.isSaved || !isAccordionComplete(accordion.id)
                                    ? 'text-gray-500'
                                    : 'text-white'
                            }`}
                        >{accordion.isSaved ? "Despesa Salva" : "Salvar Despesa"}</Text>
                    </TouchableOpacity>

                    {/* Delete Accordion - Keep commented or implement if needed */}
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
                className={`w-full p-3 mb-4 rounded-lg ${
                    isAddExpenseDisabled
                        ? 'bg-gray-300'
                        : 'bg-blue-500'
                }`}
                onPress={createNewRefund}
                disabled={isAddExpenseDisabled}
            >
                <Text
                    className={`text-center font-bold ${
                        isAddExpenseDisabled
                            ? 'text-gray-500'
                            : 'text-white'
                    }`}
                >
                    {isFirstAction ? "Começar Reembolso" : "Adicionar Nova Despesa"}
                </Text>
            </TouchableOpacity>

            {/* Submit and Cancel Buttons */}
            <View className="flex-row justify-between items-center mb-10">
                 {/* Cancel Button */}
                 <TouchableOpacity
                    onPress={handleCancel}
                    disabled={isCancelDisabled}
                    className={`flex-1 p-3 rounded-lg mr-2 ${
                        isCancelDisabled
                            ? 'bg-gray-300'
                            : 'bg-red-500'
                        }`
                    }
                >
                    <Text
                        className={`text-center font-bold ${
                            isCancelDisabled
                                ? 'text-gray-500'
                                : 'text-white'
                            }`
                        }
                    >
                        Cancelar
                    </Text>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitDisabled}
                    className={`flex-1 p-3 rounded-lg ml-2 ${
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
                        Enviar Pedido
                    </Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

export default RefundRequestScreen;
