import {
  checkManagePermission,
  requestManagePermission,
} from "manage-external-storage";
import { useCallback, useState } from "react";

type PermissionResponse = null | {
  status: "granted" | "denied";
};

export const useManagerPermissions = () => {
  const [hasPermission, setHasPermission] = useState<PermissionResponse>(null);

  const requestPermission = useCallback(async () => {
    if (!(await checkManagePermission())) {
      const hasPermission = await requestManagePermission();
      setHasPermission(
        hasPermission ? { status: "granted" } : { status: "denied" }
      );
    }
  }, []);

  return [hasPermission, requestPermission] as const;
};
