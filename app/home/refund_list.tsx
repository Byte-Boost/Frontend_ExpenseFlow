import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";

import RefundService from "@/services/refundService";
import { formatCurrency } from "@/utils/formmatters";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import RefundInfo from "@/components/RefundInfo";
import Pagination from "@/components/Pagination";

const _refundService = new RefundService();

export default function RefundList() {
  const currentDate = new Date();

  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());
  const [refunds, setRefunds] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedTotal, setSelectedTotal] = useState<string | null>(null);

  const [isTotalsVisible, setIsTotalsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [maxPages, setMaxPages] = useState(1);

  // Month wrap-around logic
  if (displayMonth < 1) {
    setDisplayMonth(12);
    setDisplayYear(displayYear - 1);
  } else if (displayMonth > 12) {
    setDisplayMonth(1);
    setDisplayYear(displayYear + 1);
  }

  // Fetch refunds when date/page changes
  useFocusEffect(
    useCallback(() => {
      const fetchRefunds = async () => {
        try {
          setIsLoading(true);
          const response = await _refundService.getRefunds(
            displayMonth.toString(),
            displayYear.toString(),
            page,
            limit
          );
          console.log("Refunds fetched:", response);
          setMaxPages(response.maxPages);
          setRefunds(response.refunds); 
        } catch (error) {
          console.error("Error fetching refunds:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRefunds();
    }, [displayMonth, displayYear, page])
  );

  useEffect(() => {
    setSelectedTotal(process.env.EXPO_PUBLIC_TOTAL_TYPE ?? null);
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
    Project: object;
    projectId: string;
  }

  const renderItem = ({ item }: { item: RefundItem }) => (
    <TouchableOpacity
      className={`p-4 bg-white mb-2 rounded-lg shadow-md border-l-4 ${
        sideColors[item.status]
      }`}
      onPress={() =>
        router.push({
          pathname: "/refund/refund_details",
          params: {
            id: item.id,
            status: item.status,
            totalValue: String(item.totalValue),
            date: item.date,
            projectName: item.Project.name,
            projectId: item.projectId,
          },
        })
      }
    >
      <View className="flex-row items-center">
        <Text className="text-gray-600">
          Status:{" "}
          <Text className={`${colors[item.status]}`}>
            {translation[item.status].toUpperCase()}
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
        Projeto: <Text className="font-bold">{item.Project.name}</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="p-5 bg-gray-50 h-full">
      {/* Month and Year Selector */}
      <View className="flex-row justify-between items-center mb-4 bg-white rounded-lg shadow-md p-4 border-l-4 border-r-4 border-[#FF8C00]">
        <TouchableOpacity onPress={() => setDisplayMonth(displayMonth - 1)}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-xl font-bold">{months[displayMonth - 1]}</Text>
          <Text className="text-gray-600">{displayYear}</Text>
        </View>
        <TouchableOpacity onPress={() => setDisplayMonth(displayMonth + 1)}>
          <Ionicons name="chevron-forward" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Totals & Filter Toggles */}
      <View className="flex-row gap-5 items-center mb-4">
        <TouchableOpacity
          onPress={() => setIsTotalsVisible(!isTotalsVisible)}
          className={`max-w-16 flex-row justify-between items-center mb-4 rounded-lg shadow-md p-4 border-2 ${
            isTotalsVisible
              ? "bg-[#FF8C00] border-transparent"
              : "bg-white border-[#FF8C00]"
          }`}
        >
          <MaterialIcons
            name="equalizer"
            size={24}
            color={isTotalsVisible ? "#fff" : "#222"}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsFilterVisible(!isFilterVisible)}
          className={`max-w-16 flex-row justify-between items-center mb-4 rounded-lg shadow-md p-4 border-2 ${
            isFilterVisible
              ? "bg-[#FF8C00] border-transparent"
              : "bg-white border-[#FF8C00]"
          }`}
        >
          <Ionicons
            name="filter"
            size={19}
            color={isFilterVisible ? "#fff" : "#222"}
          />
        </TouchableOpacity>
      </View>

      {/* No Refunds Message */}
      {refunds.length === 0 && !isLoading && (
        <Text className="text-gray-500 text-center mb-10">
          Nenhum reembolso encontrado.
        </Text>
      )}
      {isLoading && refunds.length === 0 && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      )}

      <FlatList
        ListHeaderComponent={
          <>
            {isTotalsVisible && (
              <RefundInfo
                selectedTotal={selectedTotal}
                months={months}
                displayMonth={displayMonth}
                displayYear={displayYear}
              />
            )}
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
                        onValueChange={setSelectedStatus}
                        placeholder={{
                          label: "Selecione Status",
                          value: null,
                          color: "#9EA0A4",
                        }}
                        items={[
                          { label: "Aprovado", value: "approved" },
                          { label: "Em processamento", value: "in-process" },
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
                        onValueChange={setSelectedProject}
                        placeholder={{
                          label: "Filtrar por nome do projeto",
                          value: null,
                          color: "#9EA0A4",
                        }}
                        items={Array.from(
                          new Set(refunds.map((r) => r.Project.name))
                        ).map((name) => ({
                          label: name,
                          value: name,
                        }))}
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
          </>
        }
        ListFooterComponent={
          refunds.length > 0 ? (
            <Pagination
              page={page}
              totalPages={maxPages}
              onPageChange={(page) => setPage(page)}
            />
          ) : null
        }
        data={refunds
          .filter((r) =>
            r.date.startsWith(
              `${displayYear}-${displayMonth.toString().padStart(2, "0")}`
            )
          )
          .filter((r) => !selectedStatus || r.status === selectedStatus)
          .filter((r) => !selectedProject || r.Project.name === selectedProject)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );0
}
