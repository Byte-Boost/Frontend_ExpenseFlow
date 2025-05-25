import { formatCurrency } from "@/utils/formmatters";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface RefundInfoProps {
  selectedTotal: string | null;
  months: string[];
  displayMonth: number;
  displayYear: number;
  refunds: {
    date: string;
    status: string;
    totalValue: number;
  }[];
  containerClassName?: string;
  reverseTotalType?: boolean;
}

const RefundInfo = ({
  selectedTotal,
  months,
  displayMonth,
  displayYear,
  refunds,
  containerClassName = "flex-row justify-between mb-4 bg-white rounded-lg shadow-md p-4 border-l-4 border-r-4 border-[#FF8C00]",
  reverseTotalType = false,
}: RefundInfoProps) => {
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
  );
};

export default RefundInfo;
