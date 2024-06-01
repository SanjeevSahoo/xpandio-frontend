import { useQuery } from "react-query";
import { removeJSONNull } from "@/features/common/utils/json-util";
import { menuAccessList } from "../services/common.services";

const useMenuAccessListDataQuery = (role: number) => {
  return useQuery({
    queryKey: ["menuAccessListDataQuery", role],
    queryFn: async () => {
      const data = await menuAccessList(role)
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

export default useMenuAccessListDataQuery;
