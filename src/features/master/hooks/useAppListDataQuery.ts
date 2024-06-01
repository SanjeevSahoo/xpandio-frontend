import { useQuery } from "react-query";
import { removeJSONNull } from "@/features/common/utils/json-util";
import { getApps } from "../services/common.services";

const useAppListDataQuery = () => {
  return useQuery({
    queryKey: ["appsDataQuery"],
    queryFn: async () => {
      const data = await getApps()
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

export default useAppListDataQuery;
