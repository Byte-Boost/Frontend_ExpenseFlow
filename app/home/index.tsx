import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import RefundService from "@/services/refundService";
import { useState, useCallback, useEffect } from "react";
import ProjectService from "@/services/projectService";
import { formatCurrency } from "@/utils/formmatters";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

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

  useFocusEffect(
      useCallback(() => {
        const fetchRefunds = async () => {
          try {
            const response = await _refundService.getRefunds(
              displayMonth.toString(),
              displayYear.toString()
            );
            setRefunds(response);
          } catch (error) {
            console.error("Error fetching refunds:", error);
          } finally {
            // Ensure that the loading state is updated when refunds are fetched
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
        <View className="bg-white w-full h-2/6 flex flex-col rounded-lg mt-7 shadow-md border-l-4 border-l-[#FF8C00]">
          {/* Total Refunds Section */}
            {selectedTotal === "value" && (
              <View className="flex-1 flex-col rounded-xl px-4 py-2 ml-3">
                <View className="flex flex-col items-start">
                  <Text className="text-xl pb-2 flex-row items-center">
                    <Text>
                      Reembolsos de {months[displayMonth - 1]} {displayYear}
                    </Text>
                  </Text>
  
                  {/* Total Count Section */}
                  <View className="flex-row items-center">
                    <Ionicons
                      name="calculator"
                      size={24}
                      color="black"
                      className="mr-2"
                    />
                    <Text className="font-semibold text-lg">
                      TOTAL:{" "}
                      <Text className="text-black font-bold">
                        {
                          refunds.filter((refund) =>
                            refund.date.startsWith(
                              `${displayYear}-${displayMonth
                                .toString()
                                .padStart(2, "0")}`
                            )
                          ).length
                        }
                      </Text>
                    </Text>
                  </View>
  
                  {/* Aprovados (Approved) Section */}
                  <View className="flex-row items-center">
                    <Ionicons
                      name="checkmark-circle-sharp"
                      size={26}
                      color="green"
                      className="mr-2"
                    />
                    <Text className="font-semibold text-green-500 text-lg">
                      APROVADOS:{" "}
                      <Text className="text-black font-bold">
                        {
                          refunds.filter(
                            (refund) =>
                              refund.date.startsWith(
                                `${displayYear}-${displayMonth
                                  .toString()
                                  .padStart(2, "0")}`
                              ) && refund.status === "approved"
                          ).length
                        }
                      </Text>
                    </Text>
                  </View>
  
                  {/* Em Processamento (In-process) Section */}
                  <View className="flex-row items-center">
                    <Ionicons
                      name="hourglass-sharp"
                      size={26}
                      color="blue"
                      className="mr-2"
                    />
                    <Text className="text-blue-500 text-lg ">
                      EM PROCESSAMENTO:{" "}
                      <Text className="text-black font-bold">
                        {
                          refunds.filter(
                            (refund) =>
                              refund.date.startsWith(
                                `${displayYear}-${displayMonth
                                  .toString()
                                  .padStart(2, "0")}`
                              ) && refund.status === "in-process"
                          ).length
                        }
                      </Text>
                    </Text>
                  </View>
  
                  {/* Rejeitados (Rejected) Section */}
                  <View className="flex-row items-center">
                    <Ionicons
                      name="close-circle-sharp"
                      size={26}
                      color="red"
                      className="mr-2"
                    />
                    <Text className="font-semibold text-red-500 text-lg">
                      REJEITADOS:{" "}
                      <Text className="text-black font-bold">
                        {
                          refunds.filter(
                            (refund) =>
                              refund.date.startsWith(
                                `${displayYear}-${displayMonth
                                  .toString()
                                  .padStart(2, "0")}`
                              ) && refund.status === "rejected"
                          ).length
                        }
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            )}
      
            {/* Total Value Section */}
            {selectedTotal === "quantity" && (
              <View className="flex-1 flex-col rounded-xl px-4 py-2 ml-3">
                <View className="flex flex-col items-start">
                  <Text className="text-xl pb-2 flex-row items-center">
                    <Text>
                      Reembolsos de {months[displayMonth - 1]} {displayYear}
                    </Text>
                  </Text>
                  <Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="cash-outline"
                        size={24}
                        color="black"
                        className="mr-2"
                      />
                      <Text className="font-semibold text-lg">
                        Total a Receber :{" "}
                        {formatCurrency(
                          refunds
                            .filter((refund) =>
                              refund.date.startsWith(
                                `${displayYear}-${displayMonth
                                  .toString()
                                  .padStart(2, "0")}`
                              )
                            )
                            .reduce((sum, refund) => sum + refund.totalValue, 0)
                        )}
                      </Text>
                    </View>
                    {"\n"}
                    <View className="flex-row items-center">
                      <Ionicons
                        name="checkmark-circle-sharp"
                        size={24}
                        color="green"
                        className="mr-2"
                      />
                      <Text className=" text-lg text-green-500">
                        APROVADOS:{" "}
                        <Text className="text-black font-bold text-lg ">
                          {formatCurrency(
                            refunds
                              .filter(
                                (refund) =>
                                  refund.date.startsWith(
                                    `${displayYear}-${displayMonth
                                      .toString()
                                      .padStart(2, "0")}`
                                  ) && refund.status === "approved"
                              )
                              .reduce((sum, refund) => sum + refund.totalValue, 0)
                          )}
                        </Text>
                      </Text>
                    </View>
                    {"\n"}
                    <View className="flex-row items-center">
                      <Ionicons
                        name="hourglass-sharp"
                        size={24}
                        color="blue"
                        className="mr-2"
                      />
                      <Text className="text-blue-500 text-lg">
                        EM PROCESSO:{" "}
                        <Text className="text-black font-bold">
                          {formatCurrency(
                            refunds
                              .filter(
                                (refund) =>
                                  refund.date.startsWith(
                                    `${displayYear}-${displayMonth
                                      .toString()
                                      .padStart(2, "0")}`
                                  ) && refund.status === "in-process"
                              )
                              .reduce((sum, refund) => sum + refund.totalValue, 0)
                          )}
                        </Text>
                      </Text>
                    </View>
                    {"\n"}
                    <View className="flex-row items-center">
                      <Ionicons
                        name="close-circle-sharp"
                        size={24}
                        color="red"
                        className="mr-2"
                      />
                      <Text className="text-red-500 text-lg">
                        REJEITADOS:{" "}
                        <Text className="text-black font-bold">
                          {formatCurrency(
                            refunds
                              .filter(
                                (refund) =>
                                  refund.date.startsWith(
                                    `${displayYear}-${displayMonth
                                      .toString()
                                      .padStart(2, "0")}`
                                  ) && refund.status === "rejected"
                              )
                              .reduce((sum, refund) => sum + refund.totalValue, 0)
                          )}
                        </Text>
                      </Text>
                    </View>
                  </Text>
                </View>
              </View>
            )}
        </View>
        {/* <View className="bg-white w-full h-1/6 flex rounded-lg mt-12 shadow-md p-5 border-l-4 border-l-[#FF8C00]">
            
        </View> */}
      </View>
    </View>
  );
}
