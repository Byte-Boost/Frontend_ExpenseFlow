import ExpenseForm from "@/components/ExpenseForm";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { useState } from "react";

const RefundRequestScreen = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState([
    {
      name: "Project 1",
      id: 1,
    },
    {
      name: "Project 2",
      id: 2,
    },
    {
      name: "Project 3",
      id: 3,
    },
  ]);
  return (
    <ScrollView className="p-5 bg-gray-50 h-full">
      <Text className="text-2xl font-bold text-center mb-6">
        Pedido de Reembolso
      </Text>
      <View>
        <View className="grid grid-cols-3 gap-4">
          {!selectedProject &&
            projects.map((project, index) => (
              <View key={index} className="border p-4 rounded-lg ">
                <TouchableOpacity
                  onPress={() => setSelectedProject(project.id)}
                  className="flex-1 justify-center items-center"
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
