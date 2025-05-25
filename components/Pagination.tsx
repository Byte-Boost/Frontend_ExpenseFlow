import { View, Text, TouchableOpacity } from "react-native";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ page, totalPages, onPageChange }: PaginationProps) => (
  <View className="flex-row justify-center items-center my-4 space-x-2">
    <TouchableOpacity
      disabled={page <= 1}
      onPress={() => onPageChange(page - 1)}
      className={`px-3 py-1 rounded bg-orange-200 ${
        page <= 1 ? "opacity-50" : "opacity-100"
      }`}
    >
      <Text className="text-orange-700 font-semibold">{"< Prev"}</Text>
    </TouchableOpacity>
    <Text className="mx-2 text-base font-medium text-gray-700">
      Página {page} de {totalPages}
    </Text>
    <TouchableOpacity
      disabled={page >= totalPages}
      onPress={() => onPageChange(page + 1)}
      className={`px-3 py-1 rounded bg-orange-200 ${
        page >= totalPages ? "opacity-50" : "opacity-100"
      }`}
    >
      <Text className="text-orange-700 font-semibold">{"Próx >"}</Text>
    </TouchableOpacity>
  </View>
);

export default Pagination;
