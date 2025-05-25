import ExpenseForm from "@/components/ExpenseForm";
import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useCallback, useState } from "react";
import ProjectService from "@/services/projectService";
import { Ionicons } from "@expo/vector-icons";
import Pagination from "@/components/Pagination";
import { useFocusEffect } from "expo-router";

const _projectService = new ProjectService();

interface Project {
  id: number;
  name: string;
}

const RefundRequestScreen = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [maxPages, setMaxPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await _projectService.getProjects(page, limit);
      const data = response;
      setMaxPages(data.maxPages);
      setProjects(data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [page])
  );

  if (!projects) {
    return (
      <View className="flex-1 justify-center items-center ">
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  return (
    <View className="flex-1 px-6 py-8">
      {!selectedProject ? (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text className="text-gray-500 text-center">
              Nenhum projeto encontrado.
            </Text>
          }
          renderItem={({ item }) => (
            <View className="bg-white rounded-lg shadow-md p-5 mb-4 border-l-4 border-l-[#FF8C00]">
              <TouchableOpacity
                onPress={() => setSelectedProject(item.id)}
                className="flex flex-row items-center justify-between"
              >
                <Text className="text-xl font-semibold text-[#333333]">
                  {item.name}
                </Text>
                <Ionicons name="folder" size={24} color="#FF8C00" />
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            <>
              {projects.length > 0 && (
                <Pagination
                  page={page}
                  totalPages={maxPages}
                  onPageChange={(page) => setPage(page)}
                />
              )}
            </>
          }
        />
      ) : (
        <ExpenseForm
          projectId={selectedProject}
          projectName={
            projects.find((project) => project.id === selectedProject)?.name ||
            "Unknown Project"
          }
          onClose={() => setSelectedProject(null)}
        />
      )}
    </View>
  );
};

export default RefundRequestScreen;
