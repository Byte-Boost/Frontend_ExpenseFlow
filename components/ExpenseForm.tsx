import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import { formatCurrency } from "@/utils/formmatters";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

import { ListItem } from "@rneui/themed";
import RefundService from "@/services/refundService";
import Refund from "@/utils/refund";
import ProjectService from "@/services/projectService";
import TypeSelector from "./TypeSelector";

const _refundService = new RefundService();
const _projectService = new ProjectService();
enum ExpenseType {
  VALUE = "value",
  QUANTITY = "quantity",
}
type ExpenseFormProps = {
  projectId: number;
  projectName: string;
  onClose: () => void;
};

interface Accordion {
  id: number;
  expenseType: string;
  description: string;
  attachment: string | null;
  inputValue: number;
  totalValue: number;
  isSaved: false;
  quantityType?: string;
}

const ExpenseForm = ({ projectId, projectName, onClose }: ExpenseFormProps) => {
  const [refund, setRefund] = useState<Refund | null>(null);
  const [expenseType, setExpenseType] = useState("");
  const [quantityOptions, setQuantityOptions] = useState([]);
  const [quantityMult, setQuantityMult] = useState(0);
  const [expenseLimit, setExpenseLimit] = useState(0);

  const [isFirstAction, setIsFirstAction] = useState(true);

  const [accordions, setAccordions] = useState<Accordion[]>([]);
  const [expandedAccordionId, setExpandedAccordionId] = useState<number | null>(
    null
  );
  const isCancelDisabled = isFirstAction;
  useEffect(() => {
    getPreferences();
  }, []);
  const getPreferences = async () => {
    const project_info = await _projectService.getProjectById(projectId);
    const preferences = project_info.preferences;
    if (preferences) {
      setExpenseLimit(preferences.expenseLimit ?? Number.MAX_SAFE_INTEGER);
      setQuantityOptions(
        preferences.quantityValues.map((item: { [key: string]: number }) => ({
          name: Object.keys(item)[0],
          value: Object.values(item)[0],
        }))
      );
    }
  };

  const createNewRefund = async () => {
    if (isFirstAction) {
      let res = await _refundService.createRefund(projectId);
      setRefund(new Refund(res.refundId));
      setIsFirstAction(false);
    }
    addAccordion();
  };

  const addAccordion = () => {
    const newAccordion: Accordion = {
      id: accordions.length + 1,
      expenseType: "",
      description: "",
      attachment: null,
      inputValue: 0,
      totalValue: 0,
      isSaved: false,
    };
    setAccordions([...accordions, newAccordion]);
    setExpandedAccordionId(newAccordion.id);
  };

  const toggleAccordion = (id: number) => {
    const currentAccordion = accordions.find(
      (accordion) => accordion.id === expandedAccordionId
    );

    if (expandedAccordionId === id && accordions.length) {
      if (currentAccordion && accordionHasError(currentAccordion)) {
        Alert.alert(
          "Aviso",
          "Preencha todos os campos antes de abrir outra Despesa"
        );
        return;
      }
    }

    setExpandedAccordionId(expandedAccordionId === id ? null : id);
  };

  const resetState = () => {
    setAccordions([]);
    setExpandedAccordionId(null);
    setIsFirstAction(true);
    setRefund(null);
  };

  const handleCancel = () => {
    if (!refund || !refund.id) {
      resetState();
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
              Alert.alert(
                "Cancelado",
                "Pedido de reembolso cancelado com sucesso."
              );
            } catch (error: any) {
              console.error("Failed to delete refund:", error);
              if (error.response && error.response.status === 403) {
                Alert.alert(
                  "Erro",
                  "Não é possível cancelar um reembolso que já foi processado."
                );
                // Optionally reset state even on error, depending on desired UX
                // resetState();
              } else {
                Alert.alert(
                  "Erro",
                  "Não foi possível cancelar o pedido de reembolso. Tente novamente."
                );
              }
            }
          },
          style: "destructive", // iOS style for destructive actions
        },
      ]
    );
  };

  const updateAccordion = (id: number, field: string, value: any) => {
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.id === id ? { ...accordion, [field]: value } : accordion
      )
    );
    if (field === "inputValue") {
      setAccordions((prevAccordions) =>
        prevAccordions.map((accordion) =>
          accordion.id === id
            ? {
                ...accordion,
                totalValue:
                  value *
                  (accordion.expenseType === ExpenseType.QUANTITY
                    ? quantityMult ?? 1
                    : 1),
              }
            : accordion
        )
      );
    }
  };

  const saveAccordion = async (id: number) => {
    const accordion = accordions.find((accordion) => accordion.id === id);
    if (!accordion) {
      Alert.alert("Erro", "Accordion não encontrado.");
      return;
    }

    const { expenseType, totalValue, quantityType, attachment, description } =
      accordion;

    if (accordionHasError(accordion)) {
      Alert.alert(
        "Aviso",
        "Preencha todos os campos obrigatórios antes de salvar."
      );
      return;
    }
    try {
      if (!attachment) {
        Alert.alert("Erro", "Anexo de recibo não encontrado.");
        return;
      }
      let base64attachment = await FileSystem.readAsStringAsync(attachment, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (!refund) {
        Alert.alert("Erro", "Reembolso não encontrado.");
        return;
      }
      console.log(
        refund.id,
        expenseType,
        totalValue,
        description,
        quantityType
      );
      let expenseId = await _refundService.createExpense(
        refund.id,
        expenseType,
        totalValue,
        description,
        base64attachment,
        quantityType
      );
      updateAccordion(id, "isSaved", true);
      updateAccordion(id, "expenseId", expenseId);
    } catch (err) {
      console.log(err);
      Alert.alert("Erro", "Erro ao salvar a despesa.");
    }
  };

  const handleImageUpload = async (id: number) => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (
      cameraPermission.status !== "granted" ||
      mediaPermission.status !== "granted"
    ) {
      Alert.alert(
        "Permissão necessária",
        "Você precisa permitir o acesso à câmera e à galeria para adicionar um recibo."
      );
      return;
    }

    Alert.alert("Selecionar Imagem", "Como você deseja adicionar o recibo?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Galeria",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
          });

          if (!result.canceled) {
            updateAccordion(id, "attachment", result.assets[0].uri);
          }
        },
      },
      {
        text: "Câmera",
        onPress: async () => {
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
          });

          if (!result.canceled) {
            updateAccordion(id, "attachment", result.assets[0].uri);
          }
        },
      },
    ]);
  };

  const removeImage = () => {
    updateAccordion(expandedAccordionId!, "attachment", null);
  };

  const handleSubmit = async () => {
    if (isFirstAction || refund == null) {
      Alert.alert("Erro", "Crie uma nova despesa antes de enviar o pedido.");
      return;
    }
    await _refundService.closeRefund(refund.id).then(() => {
      setAccordions([]);
      setExpandedAccordionId(null);
      setIsFirstAction(true);
    });
  };

  const accordionHasError = (accordion: Accordion) => {
    let hasType = Boolean(accordion.expenseType);
    let hasValue = accordion.totalValue > 0;
    let hasAttachment = Boolean(accordion.attachment);
    let hasDescription = Boolean(accordion.description);
    let aboveLimit = accordion.totalValue > expenseLimit;
    return (
      !hasType || !hasValue || !hasAttachment || (aboveLimit && !hasDescription)
    );
  };
  const accordionHasErrorText = (accordion: Accordion) => {
    let hasType = Boolean(accordion.expenseType);
    let hasValue = accordion.totalValue > 0;
    let hasAttachment = Boolean(accordion.attachment);
    let hasDescription = Boolean(accordion.description);
    let aboveLimit = accordion.totalValue > expenseLimit;
    return (
      <View className="bg-red-100 p-3 rounded-lg mb-4">
        <Text className="text-red-500 font-bold">
          Preencha todos os campos obrigatórios:
        </Text>
        {!hasType && <Text>- Tipo de Reembolso</Text>}
        {!hasValue && <Text>- Valor </Text>}
        {aboveLimit && !hasDescription && <Text>- Descrição</Text>}
        {!hasAttachment && <Text>- Recibo</Text>}
      </View>
    );
  };
  const allAccordionsCompleted = accordions.every(
    (accordion) => !accordionHasError(accordion)
  );

  const isSubmitDisabled =
    isFirstAction ||
    (expandedAccordionId !== null && !allAccordionsCompleted) ||
    accordions.some((accordion) => accordion.isSaved == false);

  useEffect(() => {
    setAccordions((prevAccordions) =>
      prevAccordions.map((accordion) =>
        accordion.expenseType === ExpenseType.QUANTITY
          ? {
              ...accordion,
              totalValue: accordion.inputValue * (quantityMult || 1),
            }
          : accordion
      )
    );
  }, [quantityMult]);
  return (
    <ScrollView className="p-5 bg-gray-50 h-full">
      <Text className="text-xl font-bold text-center mb-6">{projectName}</Text>
      {accordions.map((accordion) => (
        <ListItem.Accordion
          key={accordion.id}
          content={
            <>
              <Ionicons
                name={"cash"}
                className="pr-2"
                size={30}
                color={"gray"}
              />
              <ListItem.Content>
                <ListItem.Title> Despesa {accordion.id}</ListItem.Title>
              </ListItem.Content>
            </>
          }
          isExpanded={expandedAccordionId === accordion.id}
          onPress={() => toggleAccordion(accordion.id)}
        >
          {/* Conteúdo do Accordion */}
          {accordionHasError(accordion) && accordionHasErrorText(accordion)}

          {accordion.isSaved && (
            <View className="bg-green-100 p-3 rounded-lg mb-4">
              <Text className="text-green-500 font-bold">
                Despesa Salva com Sucesso!
              </Text>
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
                updateAccordion(accordion.id, "expenseType", ExpenseType.VALUE);
              }}
              className={`flex-1 flex-row items-center p-2 rounded-lg border mr-2 ${
                accordion.expenseType === ExpenseType.VALUE
                  ? "border-blue-500"
                  : "border-gray-300"
              }`}
            >
              <Ionicons
                name="pricetag"
                size={20}
                color={
                  accordion.expenseType === ExpenseType.VALUE ? "blue" : "gray"
                }
              />
              <Text
                className={`ml-2 ${
                  accordion.expenseType === ExpenseType.VALUE
                    ? "text-blue-500"
                    : "text-gray-700"
                }`}
              >
                Valor
              </Text>
            </TouchableOpacity>

            {quantityOptions.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  if (accordion.isSaved) {
                    return;
                  }
                  updateAccordion(
                    accordion.id,
                    "expenseType",
                    ExpenseType.QUANTITY
                  );
                }}
                className={`flex-1 flex-row items-center p-2 rounded-lg border ml-2 ${
                  accordion.expenseType === ExpenseType.QUANTITY
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
              >
                <Ionicons
                  name="car-sport"
                  size={20}
                  color={
                    accordion.expenseType === ExpenseType.QUANTITY
                      ? "blue"
                      : "gray"
                  }
                />
                <Text
                  className={`ml-2 ${
                    accordion.expenseType === ExpenseType.QUANTITY
                      ? "text-blue-500"
                      : "text-gray-700"
                  }`}
                >
                  Quantidade
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {accordion.expenseType === ExpenseType.QUANTITY && (
            <TypeSelector
              onValueChange={(value, label) => {
                setQuantityMult(Number(value));
                updateAccordion(accordion.id, "quantityType", label);
              }}
              selectedValue={""}
              options={quantityOptions}
            />
          )}
          <Text className="mb-2 text-lg font-bold">
            {" "}
            Descrição {accordion.totalValue > expenseLimit ? "*" : ""}
          </Text>
          <View className="flex-row items-center bg-white p-2 rounded-lg border border-[#ccc] mb-4">
            <Ionicons name="pencil" size={20} color="#6B7280" />
            <TextInput
              value={accordion.description}
              onChangeText={(text) =>
                updateAccordion(accordion.id, "description", text)
              }
              placeholder="Descreva a razão da despesa"
              multiline
              className="ml-2 w-full h-24 text-left"
              editable={!accordion.isSaved}
            />
          </View>

          <Text className="mb-2 text-lg font-bold">Valor *</Text>

          {accordion.totalValue > expenseLimit ? (
            <Text className="text-md pb-2 font-bold text-[#e3be22]">
              {" "}
              Você está acima do limite de {expenseLimit}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              padding: 10,
              borderRadius: 8,
              borderColor: "#ccc",
              marginBottom: 20,
            }}
          >
            <MaterialIcons
              name={
                accordion.expenseType == ExpenseType.VALUE
                  ? "attach-money"
                  : "add-box"
              }
              size={20}
              color="#6B7280"
            />
            <TextInput
              value={accordion.inputValue.toString()}
              onChangeText={(text) =>
                updateAccordion(accordion.id, "inputValue", text)
              }
              placeholder="Insira o Valor da Despesa"
              keyboardType="numeric"
              style={{ marginLeft: 10, flex: 1 }}
              editable={!accordion.isSaved}
            />
            {accordion.expenseType === ExpenseType.QUANTITY && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 10,
                }}
              >
                <Text style={{ color: "#6B7280", fontSize: 14 }}>
                  <FontAwesome name="times" size={16} color="#6B7280" />{" "}
                  {quantityMult}
                </Text>
              </View>
            )}
          </View>
          <Text className="mb-2 text-lg font-semibold text-gray-700">
            Recibo *
          </Text>
          <TouchableOpacity
            onPress={() => handleImageUpload(accordion.id)}
            disabled={accordion.isSaved}
            className={`p-3 rounded-lg flex-row items-center justify-center mb-4 ${
              accordion.isSaved ? "bg-gray-300" : "bg-blue-500"
            }`}
          >
            <Ionicons
              name="image-outline"
              size={20}
              color={accordion.isSaved ? "gray" : "white"}
            />
            <Text
              className={`ml-2 ${
                accordion.isSaved ? "text-gray-500" : "text-white font-semibold"
              }`}
            >
              {accordion.attachment ? "Alterar Recibo" : "Adicionar Recibo"}
            </Text>
          </TouchableOpacity>

          {accordion.attachment && (
            <View className="mb-6">
              <MaterialIcons
                name={expenseType == ExpenseType.VALUE ? "close" : "close"}
                size={20}
                color="#FF0000"
                onPress={removeImage}
              />
              <Image
                source={{ uri: accordion.attachment || undefined }}
                style={{ width: 150, height: 150, borderRadius: 8 }}
              />
            </View>
          )}

          <View className="bg-[#f0f0f0] p-4 rounded-lg mb-6">
            <Text className="text-sm font-bold text-[#6B7280] pb-2">
              VALOR TOTAL
            </Text>
            <Text className="text-4xl font-bold ">
              {formatCurrency(accordion.totalValue)}
            </Text>
          </View>

          {/* Save Accordion | Send to Back  */}
          <TouchableOpacity
            className={`w-full p-3 mb-10 rounded-lg ${
              accordion.isSaved || accordionHasError(accordion)
                ? "bg-gray-300"
                : "bg-green-500"
            }`}
            onPress={() => saveAccordion(accordion.id)}
            disabled={accordion.isSaved || accordionHasError(accordion)}
          >
            <Text
              className={`text-center font-bold ${
                accordion.isSaved || accordionHasError(accordion)
                  ? "text-gray-500"
                  : "text-white"
              }`}
            >
              Salvar Despesa
            </Text>
          </TouchableOpacity>
        </ListItem.Accordion>
      ))}

      {/* Add Accordion */}
      <TouchableOpacity
        className={`w-full p-3 mb-10 rounded-lg ${
          (expandedAccordionId !== null && !allAccordionsCompleted) ||
          accordions.some((accordion) => accordion.isSaved == false)
            ? "bg-gray-300"
            : "bg-blue-500"
        }`}
        onPress={createNewRefund}
        disabled={accordions.some((accordion) => accordion.isSaved == false)}
      >
        <Text
          className={`text-center font-bold ${
            (expandedAccordionId !== null && !allAccordionsCompleted) ||
            accordions.some((accordion) => accordion.isSaved == false)
              ? "text-gray-500"
              : "text-white"
          }`}
        >
          {isFirstAction ? "Começar Reembolso" : "Adicionar Despesa"}
        </Text>
      </TouchableOpacity>

      {/* Submit */}
      {isFirstAction ? null : (
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          className={`w-full p-3 mb-10 rounded-lg ${
            isSubmitDisabled ? "bg-gray-300" : "bg-green-500"
          }`}
        >
          <Text
            className={`text-center font-bold ${
              (expandedAccordionId !== null && !allAccordionsCompleted) ||
              accordions.some((accordion) => accordion.isSaved == false)
                ? "text-gray-500"
                : "text-white"
            }`}
          >
            Enviar Pedido de Reembolso
          </Text>
        </TouchableOpacity>
      )}
      {/* Cancel Button */}
      {!isFirstAction && (
        <TouchableOpacity
          onPress={handleCancel}
          disabled={isCancelDisabled}
          className={` w-full p-3 mb-10 rounded-lg mr-2 ${
            isCancelDisabled ? "bg-gray-300" : "bg-red-500"
          }`}
        >
          <Text
            className={`text-center font-bold ${
              isCancelDisabled ? "text-gray-500" : "text-white"
            }`}
          >
            Cancelar
          </Text>
        </TouchableOpacity>
      )}

      {/* Voltar */}
      {isFirstAction && (
        <TouchableOpacity
          onPress={onClose}
          className={`w-full p-3 mb-10 rounded-lg bg-orange-600`}
        >
          <Text className={`text-center font-bold text-white`}>Voltar</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default ExpenseForm;
