import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import RefundService from "@/services/refundService";
import { useState, useCallback } from "react";
import ProjectService from "@/services/projectService";
import { formatCurrency } from "@/utils/formmatters";
import { useFocusEffect } from "@react-navigation/native"; // importando useFocusEffect
import { AntDesign, FontAwesome5, FontAwesome6, Ionicons } from "@expo/vector-icons";

const _refundService = new RefundService();
const _projectService = new ProjectService();

export default function Home() {
  const router = useRouter();
  const [lastRefundData, setLastRefundData] = useState<RefundItem | null>(null);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);

  interface RefundItem {
    id: string;
    status: "in-process" | "rejected" | "approved";
    totalValue: number;
    date: string;
    projectId: string;
  }
  
  const translation = {
    "in-process": "Em processamento",
    rejected: "Rejeitado",
    approved: "Aprovado",
  };
  
  const colors = {
    "in-process": "text-cyan-500",
    rejected: "text-red-500",
    approved: "text-green-500",
  };

  const sideColors = {
    "in-process": "border-l-cyan-400",
    rejected: "border-l-red-400",
    approved: "border-l-green-400",
  };

  const renderLastRefund = ({ item }: { item: RefundItem }) => (
    <TouchableOpacity className="ml-4">
      <View className="flex mb-1 bg-[#EBEBEB] rounded-2xl p-1 max-w-[15rem]">
        <Text className="text-[#4C4C4C]">
          Status:{" "}
          <Text className={`text-[#4C4C4C] font-bold`}>
            {translation[item.status].toLocaleUpperCase()}
          </Text>
        </Text>
      </View>
      <Text className="text-lg font-semibold mb-1 mt-3">
        Quantidade: {formatCurrency(item.totalValue)}
      </Text>
      <Text className="text-gray-600 mb-1">
        Data: {new Date(item.date).toLocaleString()}
      </Text>
      <Text className="text-gray-600">
        Projeto:{" "}
        <Text className="font-bold">
          {items.find((project) => project.value === item.projectId)?.label || ""}
        </Text>
      </Text>
    </TouchableOpacity>
  );

  const toRefundPage = () => {
    router.push('/home/refund_request');
  };

  const loadLastRefund = async (year: string, month: string) => {
    try {
      const refunds = await _refundService.getRefunds(month, year);
      if (refunds && refunds.length > 0) {
        const last = refunds[refunds.length - 1];
        setLastRefundData(last);
      } else {
        setLastRefundData(null);
      }
    } catch (error) {
      console.error("Erro ao carregar último reembolso:", error);
      setLastRefundData(null);
    }
  };

  // useFocusEffect para carregar projetos ao focar na tela
  useFocusEffect(
    useCallback(() => {
      const fetchProjects = async () => {
        try {
          const projects = await _projectService.getProjects();
          const formattedItems = projects.map(
            (project: { name: string; id: string }) => ({
              label: project.name,
              value: project.id,
            })
          );
          setItems(formattedItems);
        } catch (error) {
          console.error("Erro ao buscar projetos:", error);
        }
      };
      fetchProjects();
    }, [])
  );

  // useFocusEffect para carregar último reembolso ao focar na tela
  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      const currentYear = today.getFullYear().toString();
      const currentMonth = (today.getMonth() + 1).toString();

      loadLastRefund(currentYear, currentMonth);
    }, [])
  );

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View className="w-full h-full flex flex-col gap-4 p-4">
        <View className={`bg-white w-full h-2/6 flex-row items-center rounded-lg shadow-md border-l-4 ${sideColors[lastRefundData?.status || "in-process"]}`}>
          <View className="w-4/5 p-3">
            <Text className="text-2xl font-bold mb-2 ml-4">Status do último reembolso</Text>
            <View>
              {lastRefundData ? (
                renderLastRefund({ item: lastRefundData })
              ) : (
                <Text>Nenhum reembolso encontrado.</Text>
              )}
            </View>
          </View>
          <View className="flex-1 w-1/5 h-fit">
            <TouchableOpacity
              onPress={toRefundPage}
              className=" w-full h-full rounded-r-lg rounded-tr-lg flex justify-end items-center pr-5"
            >
              <Text className={`${colors[lastRefundData?.status || "in-process"]} pb-5`}>
                <FontAwesome5 name="plus-circle" size={55}/>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="bg-white w-full h-1/4 flex rounded-lg mt-5 shadow-md p-5 border-l-4 border-l-[#FF8C00]"></View>
        <View className="bg-white w-full h-1/6 flex rounded-lg mt-12 shadow-md p-5 border-l-4 border-l-[#FF8C00]"></View>
      </View>
    </View>
  );
}
