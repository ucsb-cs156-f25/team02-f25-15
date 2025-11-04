import { onDeleteSuccess, cellToAxiosParamsDelete } from "main/utils/UCSBOrganizationUtils";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));
describe("UCSBOrganizationUtils", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    toast.mockClear();
  });

  afterEach(() => {
    console.log.mockRestore();
  });
  test("onDeleteSuccess logs and toasts the message", () => {
    const msg = "Deleted successfully";
    onDeleteSuccess(msg);

    expect(console.log).toHaveBeenCalledWith(msg);
    expect(toast).toHaveBeenCalledWith(msg);
  });
  test("cellToAxiosParamsDelete returns correct axios config", () => {
    const cell = { row: { original: { orgCode: "ZBT" } } };
    const result = cellToAxiosParamsDelete(cell);
    expect(result).toEqual({
      url: "/api/ucsborganizations",
      method: "DELETE",
      params: { orgCode: "ZBT" },
    });
  });

  test("cellToAxiosParamsDelete survives missing nested properties (kills optional chaining mutant)", () => {
    expect(() => cellToAxiosParamsDelete(undefined)).not.toThrow();
    expect(() => cellToAxiosParamsDelete({})).not.toThrow();
    expect(() => cellToAxiosParamsDelete({ row: {} })).not.toThrow();
    const cell = { row: { original: { orgCode: "ZBT" } } };
    const result = cellToAxiosParamsDelete(cell);
    expect(result).toEqual({
      url: "/api/ucsborganizations",
      method: "DELETE",
      params: { orgCode: "ZBT" },
    });
  });
});
