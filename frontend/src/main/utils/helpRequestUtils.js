import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
<<<<<<< HEAD
    url: "/api/helprequest",
=======
    url: "/api/helprequests",
>>>>>>> origin/jl-menuitemreview-table
    method: "DELETE",
    params: {
      id: cell.row.original.id,
    },
  };
}
