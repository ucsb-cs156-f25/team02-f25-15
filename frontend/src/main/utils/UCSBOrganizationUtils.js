import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  const orgCode = cell?.row?.original?.orgCode;
  return {
    url: "/api/ucsborganizations",
    method: "DELETE",
    params: { orgCode },
  };
}
