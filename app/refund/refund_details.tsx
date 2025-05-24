import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import ImageViewing from "react-native-image-viewing";
import RefundService from "@/services/refundService";
import Refund from "@/utils/refund"; 
import Expense from "@/utils/expense";
import ExpenseService from "@/services/expenseService";

export default function RefundDetails() {
  const router = useRouter();
  const { id, totalValue, status, date, projectId, type, projectName } = useLocalSearchParams();

  const [refund, setRefund] = useState<Refund | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Adicionado estado de carregamento
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null); // Estado para controlar o item expandido

  const [imageVisible, setImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  const formattedStatus = String(status || "").replace("-", " ");
  const formattedDate = new Date(date as string).toLocaleDateString("pt-BR");

  const handleBack = () => {
    router.back();
  };



  const refundService = new RefundService();
  const expenseService = new ExpenseService();
  
  const translation = {
    "in process": "EM PROCESSAMENTO",
    rejected: "REJEITADO",
    approved: "APROVADO",
    quantity: "Quantidade",
    value: "Valor",
  };

  async function fetchRefund() {
    const refundData = await refundService.getRefundById(Number(id));
    setRefund(refundData);
  }

  
  async function fetchExpenses() {
    const ids = refund.Expenses.map(e => e.id);
    const expensesFetched = await Promise.all(ids.map(id => expenseService.getExpenseById(id)));
    ;
    setExpenses(expensesFetched);
  }
  
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true); // Inicia o carregamento
      try {
        const refundData = await refundService.getRefundById(Number(id));
        setRefund(refundData);
        // Usar diretamente as despesas do objeto de reembolso
        if (refundData && Array.isArray(refundData.Expenses)) {
          setExpenses(refundData.Expenses);
        } else {
          console.warn("Refund or Expenses not available:", refundData?.Expenses);
          setExpenses([]); 
        }
      } catch (error) {
        console.error("Error fetching refund details:", error);
        setExpenses([]); 
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    if (refund && Array.isArray(refund.Expenses)) {
      const ids = refund.Expenses.map(e => e.id);
      console.log("Expense IDs:", ids); // Should log: [3]
    } else {
      console.warn("Refund or Expenses not available:", refund?.Expenses);
    }
  }, [refund]);

  useEffect(() => {
    async function fetchData() {
      const refundData = await refundService.getRefundById(Number(id));
      setRefund(refundData);
      if (refundData && Array.isArray(refundData.Expenses)) {
        const ids = refundData.Expenses.map(e => e.id);
        const expensesFetched = await Promise.all(ids.map(id => expenseService.getExpenseById(id)));
        setExpenses(expensesFetched);
      } else {
        console.warn("Refund or Expenses not available:", refundData?.Expenses);
      }
    }

    fetchData();
  }, [id]);




  useEffect(() => {
    console.log("Refund:", refund);
    
    
  }
  , [refund, expenses]);


  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };


  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 flex-row items-center justify-between bg-[#FF8C00]">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Detalhes</Text>
        <View className="w-8" />
      </View>

      <View className="p-4">
        <View className="bg-white rounded-2xl shadow-md p-4 mb-4 border border-gray-200">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold text-gray-700">#{id}</Text>
            <Text className="text-lg font-bold text-green-600">
              R$ {totalValue}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm text-gray-500">{formattedDate}</Text>
            <Text className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
               {projectName}
            </Text>
          </View>

          <View className="mb-4">
            
            <Text className="font-semibold text-gray-700">Status:</Text>
            <Text
              className={`font-semibold px-2 py-1 rounded-full w-fit ${
              formattedStatus === "in process"
                ? "bg-blue-200 text-blue-800"
                : formattedStatus === "approved"
                ? "bg-green-200 text-green-800"
                : formattedStatus === "rejected"
                ? "bg-red-200 text-red-800"
                : "bg-gray-200 text-gray-800"
              }`}
            >
              {translation[formattedStatus] || formattedStatus}
            </Text>
          </View>
              {formattedStatus === "rejected" && refund?.rejectionReason && (
                <>
                  <Text className="font-semibold text-gray-700 mb-2">
                    Motivo da Rejeição:
                  </Text>
                  <View className="bg-gray-200 p-2 rounded-md">
                    <Text className="text-gray-700">
                      {refund.rejectionReason}
                    </Text>
                  </View>
                </>
              )}
          <Text className="text-xl font-bold mt-4 text-gray-800 mb-4">
            R$ {totalValue}
          </Text>

          {/* Implementação do Acordeão */}
            {expenses.map((exp, idx) => (
              <View
                key={exp.id || idx} 
                className="bg-gray-100 rounded-xl mb-4 border border-gray-200 overflow-hidden"
              >
                {/* Cabeçalho Clicável */}
                <TouchableOpacity
                  onPress={() => toggleExpand(idx)}
                  className="p-4 flex-row justify-between items-center bg-gray-200"
                >
                  <Text className="text-gray-700 font-semibold">R$ {exp.value?.toFixed(2) || "0.00"}</Text>
                  <Ionicons 
                    name={expandedIndex === idx ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="gray" 
                  />
                </TouchableOpacity>

                {/* Conteúdo Expansível */}
                {expandedIndex === idx && (
                  <View className="p-4 border-t border-gray-300">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-500 font-semibold">Data</Text>
                      <Text className="text-gray-700">
                        {exp.date ? new Date(exp.date).toLocaleDateString("pt-BR") : ""}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-500 font-semibold">Tipo</Text>
                      <Text className="text-gray-700">
                        {exp.type ? translation[exp.type] || exp.type : ""}
                        {exp.type === "quantity" && "/"}
                        {exp.quantityType ? translation[exp.quantityType] || exp.quantityType : ""}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-gray-500 font-semibold">Valor</Text>
                      <Text className="text-gray-700">R$ {exp.value?.toFixed(2) || "0.00"}</Text>
                    </View>
                    {exp.description && (
                      <View className="mb-2">
                        <Text className="text-gray-500 font-semibold mb-1">
                          Descrição
                        </Text>
                        <View className="bg-gray-200 p-2 rounded-md">
                          <Text className="text-gray-700">
                          {exp.description}
                          </Text>
                        </View>
                      </View>
                    )}
                    {exp.attachment || exp.file || exp.attachmentRef ? (
                      <View className="mb-2">
                      <Text className="text-gray-500 font-semibold mb-1">
                        Anexos
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const attachmentUri = exp.attachment || exp.file || exp.attachmentRef;
                          if (attachmentUri) {
                            setSelectedImage(attachmentUri);
                            setImageVisible(true);
                          }
                        }}
                      >
                        <Image
                          source={{ uri: exp.attachment }}
                          className="w-full h-40 rounded-lg"
                          resizeMode="cover"
                        />
                      </TouchableOpacity>

                      </View>
                    ) : (
                      <View className="mb-2">
                      <Text className="text-gray-500 font-semibold mb-1">
                        Anexos
                      </Text>
                      <Text className="text-gray-400">Nenhum anexo disponível</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
        </View>
        </View>
        {selectedImage && (
          <ImageViewing
            images={[{ uri: selectedImage }]}
            imageIndex={0}
            visible={imageVisible}
            onRequestClose={() => setImageVisible(false)}
          />
        )}
    </ScrollView>

  );
}
