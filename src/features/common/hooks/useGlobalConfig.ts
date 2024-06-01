import { setAppMode } from "@/features/common/globalSlice";
import { useAppDispatch } from "@/store/hooks";

function useGlobalService() {
  const dispatch = useAppDispatch();

  return {
    setAppMode: (newAppMode: string) => {
      dispatch(setAppMode(newAppMode));
    },
  };
}

export default useGlobalService;
