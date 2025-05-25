import RefundService from "@/services/refundService";
import { formatCurrency } from "@/utils/formmatters";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";

interface RefundInfoProps {
  selectedTotal: string | null;
  months: string[];
  displayMonth: number;
  displayYear: number;
  containerClassName?: string;
  reverseTotalType?: boolean;
}

const _refundService = new RefundService();

const RefundInfo = ({
  selectedTotal,
  months,
  displayMonth,
  displayYear,
  containerClassName = "flex-row justify-between mb-4 bg-white rounded-lg shadow-md p-4 border-l-4 border-r-4 border-[#FF8C00]",
  reverseTotalType = false,
}: RefundInfoProps) => {
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const [approvedCount, setApprovedCount] = useState(0);
  const [approvedValue, setApprovedValue] = useState(0);

  const [inProcessCount, setInProcessCount] = useState(0);
  const [inProcessValue, setInProcessValue] = useState(0);

  const [rejectedCount, setRejectedCount] = useState(0);
  const [rejectedValue, setRejectedValue] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isReversed, setIsReversed] = useState(reverseTotalType);

  const fetchSummary = async () => {
    try {
      let data = await _refundService.getSummary(
        displayMonth.toString(),
        displayYear.toString()
      );
      setApprovedCount(data["approved"].quantity);
      setApprovedValue(data["approved"].totalValue);

      setInProcessCount(data["in-process"].quantity);
      setInProcessValue(data["in-process"].totalValue);

      setRejectedCount(data["rejected"].quantity);
      setRejectedValue(data["rejected"].totalValue);

      setTotalQuantity(data.totalQuantity);
      setTotalValue(data.totalValue);
    } catch (e) {
      console.error("Error fetching summary:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [displayMonth, displayYear])
  );

  let displayTotal = selectedTotal;
  if (isReversed) {
    if (selectedTotal === "quantity") displayTotal = "value";
    else if (selectedTotal === "value") displayTotal = "quantity";
  }
  return (
    <View className={containerClassName}>
      {isLoading && (
        <View className="flex-1 justify-center items-center ">
          <ActivityIndicator size="large" color="#FF8C00" />
        </View>
      )}
      {/* Total Refunds Section */}
      {displayTotal === "quantity" && !isLoading && (
        <View className="flex-1   p-4 ">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-black">
              Quantidade de Reembolsos
            </Text>

            <TouchableOpacity
              onPress={() => setIsReversed((prev) => !prev)}
              className="ml-2"
            >
              <Ionicons name="swap-horizontal" size={24} color="#FF8C00" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-500 mb-3">
            ({months[displayMonth - 1]} {displayYear})
          </Text>

          <View className="border-b border-gray-300 mb-3" />

          {/* Total */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-black">TOTAL</Text>
            <Text className="text-lg font-bold text-black">
              {totalQuantity}
            </Text>
          </View>

          {/* Approved */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="green" />
              <Text className="ml-2 text-green-700 font-semibold">
                APROVADOS
              </Text>
            </View>
            <Text className="text-black font-bold">{approvedCount}</Text>
          </View>

          {/* In Process */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Ionicons name="hourglass" size={24} color="blue" />
              <Text className="ml-2 text-blue-600 font-semibold">
                EM PROCESSAMENTO
              </Text>
            </View>
            <Text className="text-black font-bold">{inProcessCount}</Text>
          </View>

          {/* Rejected */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="close-circle" size={24} color="red" />
              <Text className="ml-2 text-red-600 font-semibold">
                REJEITADOS
              </Text>
            </View>
            <Text className="text-black font-bold">{rejectedCount}</Text>
          </View>
        </View>
      )}
      {/* Total Value Section */}
      {displayTotal === "value" && !isLoading && (
        <View className="flex-1  p-4 ">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-black">
              Valores de Reembolsos
            </Text>
            <TouchableOpacity
              onPress={() => setIsReversed((prev) => !prev)}
              className="ml-2"
            >
              <Ionicons name="swap-horizontal" size={24} color="#FF8C00" />
            </TouchableOpacity>
          </View>
          <Text className="text-sm text-gray-500 mb-3">
            ({months[displayMonth - 1]} {displayYear})
          </Text>

          <View className="border-b border-gray-300 mb-3" />

          {/* Total to Receive */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-black">TOTAL</Text>
            </View>
            <Text className="text-lg text-black font-bold">
              {formatCurrency(totalValue)}
            </Text>
          </View>

          {/* Approved */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={24} color="green" />
              <Text className="ml-2 text-green-700 font-semibold">
                APROVADOS
              </Text>
            </View>
            <Text className="text-black font-bold">
              {formatCurrency(approvedValue)}
            </Text>
          </View>

          {/* In Process */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Ionicons name="hourglass" size={24} color="blue" />
              <Text className="ml-2 text-blue-600 font-semibold">
                EM PROCESSAMENTO
              </Text>
            </View>
            <Text className="text-black font-bold">
              {formatCurrency(inProcessValue)}
            </Text>
          </View>

          {/* Rejected */}
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="close-circle" size={24} color="red" />
              <Text className="ml-2 text-red-600 font-semibold">
                REJEITADOS
              </Text>
            </View>
            <Text className="text-black font-bold">
              {formatCurrency(rejectedValue)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default RefundInfo;
