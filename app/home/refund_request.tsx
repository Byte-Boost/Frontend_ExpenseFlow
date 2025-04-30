import ExpenseForm from "@/components/ExpenseForm";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { useEffect, useState } from "react";
import ProjectService from "@/services/projectService";

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
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg ">Carregando projetos...</Text>
      </View>
    );
  }

  return (
    <ScrollView className=" bg-gray-50 h-full">
      <Text className="text-2xl font-bold text-center mb-6">
        Pedido de Reembolso
      </Text>
      <View>
        <View className="grid grid-cols-3 ">
          {!selectedProject &&
            projects.map((project: Project, index: number) => (
              <View
                key={index}
                className="border-b-2 p-4 border-b-[#75757571] h-24"
              >
                <TouchableOpacity
                  onPress={() => setSelectedProject(project.id)}
                  className="flex-1 justify-center"
                >
                  <Text className="text-lg font-semibold">{project.name}</Text>
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
      </View>
    </ScrollView>
  );
};

export default RefundRequestScreen;
