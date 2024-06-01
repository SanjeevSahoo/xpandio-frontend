import { useQuery } from "react-query";
import { removeJSONNull } from "@/features/common/utils/json-util";
import { getAlertNotifications } from "@/features/master/services/common.services";

const useAlertNotificationDetailQuery = (team_id: number[]) => {
  return useQuery({
    queryKey: ["alertDataQuery", team_id],
    queryFn: async () => {
      const data = await getAlertNotifications(team_id)
        .then((res) => res.data)
        .catch(() => {
          throw new Error("Error Fetching Data");
        });
      return removeJSONNull(data);
    },
    cacheTime: 1000 * 60 * 1,
    staleTime: 1000 * 60 * 1,
  });
};

export default useAlertNotificationDetailQuery;
