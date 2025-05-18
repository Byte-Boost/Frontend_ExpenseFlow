import ExpenseForm from "@/components/ExpenseForm";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import ProjectService from "@/services/projectService";
import { Ionicons } from "@expo/vector-icons";

const _projectService = new ProjectService();

interface Project {
  id: number;
  name: string;
}

const RefundRequestScreen = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await _projectService.getProjects();
      const data = response;
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (!projects) {
    return (
      <View className="flex-1 justify-center items-center ">
        <ActivityIndicator size="large" color="#6A4C9C" />
      </View>
    );
  }

  return (
    <ScrollView className=" flex-1 px-6 py-8">
      <View className="grid grid-cols-1 gap-4">
        {!selectedProject &&
          projects.map((project: Project, index: number) => (
            <View
              key={index}
              className="bg-white rounded-lg shadow-md p-5 border-l-4 border-l-[#FF8C00]"
            >
              <TouchableOpacity
                onPress={() => setSelectedProject(project.id)}
                className="flex-1  flex flex-row items-center justify-between"
              >
                <Text className="text-xl font-semibold text-[#333333]">
                  {project.name}
                </Text>
                <Ionicons name="folder" size={24} color="#FF8C00" />
              </TouchableOpacity>
            </View>
          ))}
        {selectedProject && (
          <ExpenseForm
            projectId={selectedProject}
            projectName={
              projects.find((project) => project.id === selectedProject)
                ?.name || "Unknown Project"
            }
            onClose={() => setSelectedProject(null)}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default RefundRequestScreen;
