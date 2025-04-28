import { useState } from "react";
import AwesomeAlert from "react-native-awesome-alerts";

export const useAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
    callback: () => {},
  });

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error",
    callback = () => {}
  ) => {
    setAlertConfig({ show: true, title, message, type, callback });
  };

  const hideAlert = () => {
    alertConfig.callback();
    setAlertConfig({ ...alertConfig, show: false });
  };

  return {
    showAlert,
    AlertComponent: (
      <AwesomeAlert
        show={alertConfig.show}
        title={alertConfig.title}
        message={alertConfig.message}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={alertConfig.type === "success" ? "green" : "red"}
        onConfirmPressed={hideAlert}
      />
    ),
  };
};
