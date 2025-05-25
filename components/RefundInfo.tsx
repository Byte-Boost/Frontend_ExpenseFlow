import RefundService from "@/services/refundService";
import { formatCurrency } from "@/utils/formmatters";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

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
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [])
  );

  let displayTotal = selectedTotal;
  if (reverseTotalType) {
    if (selectedTotal === "quantity") displayTotal = "value";
    else if (selectedTotal === "value") displayTotal = "quantity";
  }
  return (
    <View className={containerClassName}>
      {/* Total Refunds Section */}
      {displayTotal === "quantity" && (
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
                <Text className="text-black font-bold">{totalQuantity}</Text>
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
                <Text className="text-black font-bold">{approvedCount}</Text>
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
                <Text className="text-black font-bold">{inProcessCount}</Text>
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
                <Text className="text-black font-bold">{rejectedCount}</Text>
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Total Value Section */}
      {displayTotal === "value" && (
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
                  Total a Receber : {formatCurrency(totalValue)}
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
                    {formatCurrency(approvedValue)}
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
                    {formatCurrency(inProcessValue)}
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
                    {formatCurrency(rejectedValue)}
                  </Text>
                </Text>
              </View>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default RefundInfo;
