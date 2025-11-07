import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/RecommendationRequestUtils";
import { toast } from "react-toastify";
import { vi } from "vitest";

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

describe("recommendationRequestUtils tests", () => {
  describe("onDeleteSuccess", () => {
    test("logs message and calls toast", () => {
      const consoleSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => null);

      const message = "Recommendation request deleted successfully";
      onDeleteSuccess(message);

      expect(consoleSpy).toHaveBeenCalledWith(message);
      expect(toast).toHaveBeenCalledWith(message);

      consoleSpy.mockRestore();
    });
  });

  describe("cellToAxiosParamsDelete", () => {
    test("returns correct params for delete", () => {
      const cell = {
        row: {
          original: {
            id: 17,
          },
        },
      };

      const result = cellToAxiosParamsDelete(cell);

      expect(result).toEqual({
        url: "/api/recommendationrequest",
        method: "DELETE",
        params: {
          id: 17,
        },
      });
    });
  });
});
