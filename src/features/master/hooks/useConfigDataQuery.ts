import { useQuery } from "react-query";
import { removeJSONNull } from "@/features/common/utils/json-util";
import { getConfigData } from "../services/common.services";

const useConfigDataQuery = () => {
  return useQuery({
    queryKey: ["configDataQuery"],
    queryFn: async () => {
      const data = await getConfigData()
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

export default useConfigDataQuery;
