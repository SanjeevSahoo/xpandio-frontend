import { useQuery } from "react-query";
import { removeJSONNull } from "@/features/common/utils/json-util";
import { getMenus } from "../services/common.services";

const useMenuListDataQuery = (app: number) => {
  return useQuery({
    queryKey: ["menuListDataQuery", app],
    queryFn: async () => {
      const data = await getMenus(app)
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

export default useMenuListDataQuery;
