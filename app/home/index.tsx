import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import RefundService from "@/services/refundService";
import { useState, useCallback, useEffect } from "react";
import ProjectService from "@/services/projectService";
import { formatCurrency } from "@/utils/formmatters";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import RefundInfo from "@/components/RefundInfo";

const _refundService = new RefundService();
const _projectService = new ProjectService();

export default function Home() {
  const router = useRouter();
  const currentDate = new Date();

  const [lastRefundData, setLastRefundData] = useState<RefundItem | null>(null);
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [selectedTotal, setSelectedTotal] = useState<string | null>(null);
  const [refunds, setRefunds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (displayMonth < 1) {
    setDisplayMonth(12);
    setDisplayYear(displayYear - 1);
  } else if (displayMonth > 12) {
    setDisplayMonth(1);
    setDisplayYear(displayYear + 1);
  }

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

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const renderLastRefund = ({ item }: { item: RefundItem }) => (
    <TouchableOpacity
      className="ml-2"
      onPress={() => {
        router.push({
          pathname: "/refund/refund_details",
          params: {
            id: item.id,
            status: item.status,
            totalValue: String(item.totalValue),
            date: item.date,
            projectName:
              items.find((project) => project.value === item.projectId)
                ?.label || "",
            projectId: item.projectId,
          },
        });
      }}
    >
      <View className="flex  bg-[#EBEBEB] rounded-2xl  max-w-fit p-2">
        <Text className="text-[#4C4C4C] ">
          Status:{" "}
          <Text
            className={`${colors[item.status] || " text-[#4C4C4C] "} font-bold`}
          >
            {translation[item.status].toLocaleUpperCase()}
          </Text>
        </Text>
      </View>
      <View className="flex-col mb-3">
        <Text className="text-lg font-semibold mb-1 mt-3">
          Quantidade: {formatCurrency(item.totalValue)}
        </Text>
        <Text className="text-gray-600 mb-1">
          Data: {new Date(item.date).toLocaleString()}
        </Text>
        <View className="flex-row items-center text-sm">
          <Text className="text-gray-600 ">Projeto: </Text>
          <Text className="font-bold ">
            {items.find((project) => project.value === item.projectId)?.label ||
              ""}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const toRefundPage = () => {
    router.push("/home/refund_request");
  };

  const loadLastRefund = async (year: string, month: string) => {
    try {
      const refunds = await _refundService.getRefunds(month, year, 1, 15, true);
      if (refunds && refunds.length > 0) {
        const last = refunds[refunds.length - 1];
        setLastRefundData(last);
      } else {
        setLastRefundData(null);
      }
    } catch (error) {
      console.error("Error fetching last refund:", error);
      setLastRefundData(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchProjects = async () => {
        try {
          const projects = await _projectService.getProjects();
          const formattedItems = projects.projects.map(
            (project: { name: string; id: string }) => ({
              label: project.name,
              value: project.id,
            })
          );
          setItems(formattedItems);
        } catch (error) {
          console.error("Error fetching projects:", error);
        }
      };
      fetchProjects();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchRefunds = async () => {
        try {
          const response = await _refundService.getRefunds(
            displayMonth.toString(),
            displayYear.toString(),
            1,
            15,
            true
          );
          setRefunds(response);
        } catch (error) {
          console.error("Error fetching refunds:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRefunds();
    }, [displayMonth, displayYear])
  );

  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      const currentYear = today.getFullYear().toString();
      const currentMonth = (today.getMonth() + 1).toString();

      loadLastRefund(currentYear, currentMonth);
    }, [])
  );

  useEffect(() => {
    setSelectedTotal(process.env.EXPO_PUBLIC_TOTAL_TYPE ?? null);
  }, []);

  return (
    <View className="flex align-items-center justify-center bg-[#F5F5F5] w-full h-full">
      <View className="w-full h-full flex flex-col gap-4 p-4">
        <View
          className={`bg-white w-full h-2/6 flex-row items-center rounded-lg shadow-md border-l-4 ${
            sideColors[lastRefundData?.status || "in-process"]
          }`}
        >
          <View className="w-4/5 p-4">
            <Text className="text-xl font-bold mb-2 ml-3">
              Status do último reembolso
            </Text>
            <View>
              {isLoading ? (
                <ActivityIndicator size="large" color="#FF8C00" />
              ) : lastRefundData ? (
                renderLastRefund({ item: lastRefundData })
              ) : (
                <Text className="text-gray-500 text-center">
                  Nenhum reembolso encontrado.
                </Text>
              )}
            </View>
          </View>
          <View className="flex-1 w-1/5 h-fit">
            <TouchableOpacity
              onPress={toRefundPage}
              className=" w-full h-full rounded-r-lg rounded-tr-lg flex justify-end items-center pr-5"
            >
              <Text
                className={`${
                  colors[lastRefundData?.status || "in-process"]
                } pb-5`}
              >
                <Ionicons name="add-circle" size={55} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <RefundInfo
          selectedTotal={selectedTotal}
          months={months}
          displayMonth={displayMonth}
          displayYear={displayYear}
          reverseTotalType={true}
          containerClassName="bg-white w-full h-2/6 flex flex-col rounded-lg mt-7 shadow-md border-l-4 border-l-[#FF8C00]"
        />
        {/* <View className="bg-white w-full h-1/6 flex rounded-lg mt-12 shadow-md p-5 border-l-4 border-l-[#FF8C00]">
            
        </View> */}
      </View>
    </View>
  );
}
