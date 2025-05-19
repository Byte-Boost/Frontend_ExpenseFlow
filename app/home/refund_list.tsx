import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import RefundService from "@/services/refundService";
import ProjectService from "@/services/projectService";
import { formatCurrency } from "@/utils/formmatters";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const _refundService = new RefundService();
const _projectService = new ProjectService();

export default function RefundList() {
  const currentDate = new Date();

  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [refunds, setRefunds] = useState<any[]>([]);
  const [items, setItems] = useState<{ label: string; value: string }[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTotal, setSelectedTotal] = useState<string | null>(null);

  const [isTotalsVisible, setIsTotalsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  if (displayMonth < 1) {
    setDisplayMonth(12);
    setDisplayYear(displayYear - 1);
  } else if (displayMonth > 12) {
    setDisplayMonth(1);
    setDisplayYear(displayYear + 1);
  }

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

  // Disabled this for now as i don't know if it's good feedback for the user
  // const resetFilters = () => {
  //   setSelectedStatus(null);
  //   setSelectedProject(null);
  // };
  // useEffect(() => {
  //   resetFilters();
  // }, [isFilterVisible]);

  // Fetch what type of Total is set as true

  useEffect(() => {
    setSelectedTotal(process.env.EXPO_PUBLIC_TOTAL_TYPE ?? null);
  }, []);

  useEffect(() => {
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
      } finally {
        if (refunds.length > 0) {
          setIsLoading(false);
        }
      }
    };

    fetchProjects();
  }, []);

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

  // Translation for status
  const translation = {
    "in-process": "Em processamento",
    rejected: "Rejeitado",
    approved: "Aprovado",
  };

  interface RefundItem {
    id: string;
    status: "in-process" | "rejected" | "approved";
    totalValue: number;
    date: string;
    projectId: string;
  }

  const renderItem = ({ item }: { item: RefundItem }) => (
    <TouchableOpacity
      className={`p-4 bg-white mb-2 rounded-lg shadow-md border-l-4 ${
        sideColors[item.status]
      }`}
    >
      <View className="flex-row items-center">
        <Text className="text-gray-600">
          Status:{" "}
          <Text className={` ${colors[item.status]}`}>
            {translation[item.status].toLocaleUpperCase()}
          </Text>
        </Text>
        <View className="ml-auto">
          <Ionicons name="information-circle" size={20} color="#4b5563" />
        </View>
      </View>
      <Text className="text-lg font-semibold">
        Quantidade: {formatCurrency(item.totalValue)}
      </Text>
      <Text className="text-gray-600">
        Data: {new Date(item.date).toLocaleString()}
      </Text>
      <Text className="text-gray-600">
        Projeto:{" "}
        <Text className="font-bold">
          {items.find((project) => project.value === item.projectId)?.label ||
            ""}
        </Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="p-5 bg-gray-50 h-full">
      {/* Month and Year Selector */}
      <View className="flex-row justify-between items-center mb-4 bg-white rounded-lg shadow-md p-4 border-l-4 border-r-4 border-[#FF8C00]">
        <TouchableOpacity onPress={() => setDisplayMonth(displayMonth - 1)}>
          <Text style={{ fontSize: 24 }}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </Text>
        </TouchableOpacity>
        <View className="flex-column items-center">
          <Text className="text-xl font-bold">{months[displayMonth - 1]}</Text>
          <Text className="text-gray-600">{displayYear}</Text>
        </View>
        <TouchableOpacity onPress={() => setDisplayMonth(displayMonth + 1)}>
          <Text style={{ fontSize: 24 }}>
            <Ionicons name="chevron-forward" size={24} color="black" />
          </Text>
        </TouchableOpacity>
      </View>
      {/* Toggleable Totals Section */}
      <View className="flex-row gap-5 items-center mb-4 ">
        <View
          className={`max-w-16 flex-row justify-between items-center mb-4  rounded-lg shadow-md p-4 border-2 ${
            isTotalsVisible
              ? "bg-[#FF8C00] border-transparent"
              : "bg-white border-[#FF8C00]"
          }`}
        >
          <TouchableOpacity
            onPress={() => setIsTotalsVisible(!isTotalsVisible)}
            className=""
          >
            <Text className="text-lg font-bold ">
              <MaterialIcons
                name="equalizer"
                size={24}
                color={isTotalsVisible ? "#fff" : "#222"}
              />
            </Text>
          </TouchableOpacity>
        </View>
        {/* Toggleable Filter Section */}
        <View
          className={`max-w-16 flex-row justify-between items-center mb-4  rounded-lg shadow-md p-4 border-2 
          ${
            isFilterVisible
              ? "bg-[#FF8C00] border-transparent"
              : "bg-white border-[#FF8C00]"
          }`}
        >
          <TouchableOpacity
            onPress={() => setIsFilterVisible(!isFilterVisible)}
            className=""
          >
            <Text className="text-lg font-bold ">
              <Ionicons
                name="filter"
                size={19}
                color={isFilterVisible ? "#fff" : "#222"}
              />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Conditional Rendering of Totals */}
      {isTotalsVisible && (
        <View className="flex-row justify-between mb-4 bg-white rounded-lg shadow-md p-4 border-l-4 border-r-4 border-[#FF8C00]">
          {/* Total Refunds Section */}
          {selectedTotal === "quantity" && (
            <View className="flex-1 flex-col items-center rounded-xl px-4 py-2">
              <View className="flex flex-col items-start">
                <Text className="font-bold text-xl pb-2 flex-row items-center">
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
          {selectedTotal === "value" && (
            <View className="flex-1 flex-col items-center rounded-xl px-4 py-2">
              <View className="flex items-start">
                <Text className="font-bold text-xl pb-2 flex-row items-center">
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
      )}
      {/* Filters */}
      {isFilterVisible && (
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3 text-gray-800">
            Filtros
          </Text>
          <View className="flex-row justify-between gap-4">
            {/* Status Filter */}
            <View className="flex-1 flex-row items-center border border-gray-400 rounded-xl px-4 py-3 bg-white shadow-sm">
              <Ionicons
                name="filter"
                size={24}
                color="black"
                style={{ marginRight: 8 }}
              />
              <View className="flex-1">
                <RNPickerSelect
                  onValueChange={(value) => setSelectedStatus(value)}
                  placeholder={{
                    label: "Selecione Status",
                    value: null,
                    color: "#9EA0A4",
                  }}
                  items={[
                    { label: "Em processo", value: "in-process" },
                    { label: "Aprovado", value: "approved" },
                    { label: "Rejeitado", value: "rejected" },
                  ]}
                  useNativeAndroidPickerStyle={false}
                  style={{
                    inputAndroid: {
                      fontSize: 14,
                      paddingVertical: 8,
                      paddingHorizontal: 2,
                      color: "#000",
                    },
                    placeholder: {
                      color: "#9EA0A4",
                      fontSize: 12,
                    },
                  }}
                />
              </View>
            </View>

            {/* Project Filter */}
            <View className="flex-1 flex-row items-center border border-gray-400 rounded-xl px-4 py-3 bg-white shadow-sm">
              <Ionicons
                name="filter"
                size={24}
                color="black"
                style={{ marginRight: 8 }}
              />
              <View className="flex-1">
                <RNPickerSelect
                  onValueChange={(value) => setSelectedProject(value)}
                  placeholder={{
                    label: "Selecione Projeto",
                    value: null,
                    color: "#9EA0A4",
                  }}
                  items={items}
                  useNativeAndroidPickerStyle={false}
                  style={{
                    inputAndroid: {
                      fontSize: 14,
                      paddingVertical: 8,
                      paddingHorizontal: 2,
                      color: "#000",
                    },
                    placeholder: {
                      color: "#9EA0A4",
                      fontSize: 12,
                    },
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* No Refunds Message */}
      {refunds.length === 0 && !isLoading && (
        <Text className="text-gray-500 text-center">
          Nenhum reembolso encontrado.
        </Text>
      )}
      {isLoading && refunds.length === 0 && (
        <View className="flex-1 justify-center items-center ">
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      )}
      {/* Refunds List */}
      <FlatList
        data={refunds
          .filter((refund) =>
            refund.date.startsWith(
              `${displayYear}-${displayMonth.toString().padStart(2, "0")}`
            )
          )
          .filter(
            (refund) => !selectedStatus || refund.status === selectedStatus
          )
          .filter(
            (refund) => !selectedProject || refund.projectId === selectedProject
          )}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
