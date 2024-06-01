import { useQuery } from "react-query";
import { removeJSONNull } from "@/features/common/utils/json-util";
import { getConfigItemData } from "../services/common.services";

const useConfigItemDataQuery = (item: number) => {
  return useQuery({
    queryKey: ["configItemDataQuery", item],
    queryFn: async () => {
      const data = await getConfigItemData(item)
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

export default useConfigItemDataQuery;
