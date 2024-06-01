import { useQuery } from "react-query";
import { removeJSONNull } from "@/features/common/utils/json-util";
import { getRoles } from "../services/common.services";

const useRoleListDataQuery = () => {
  return useQuery({
    queryKey: ["roleListDataQuery"],
    queryFn: async () => {
      const data = await getRoles()
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

export default useRoleListDataQuery;
