import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import { VariantGroupEditor } from "@/features/admin-menu/components/VariantGroupEditor";
import type { VariantGroup } from "@/features/menu/types/menu.types";

const GROUP: VariantGroup = {
  id: "vg-001",
  name: "Tamaño",
  required: true,
  sortOrder: 0,
  options: [
    { id: "vo-001", name: "Individual", priceAdjustment: 0, sortOrder: 0 },
    { id: "vo-002", name: "Familiar", priceAdjustment: 4, sortOrder: 1 },
  ],
};

describe("VariantGroupEditor", () => {
  it("renders an empty state with an add-group button when no groups exist", () => {
    const onChange = vi.fn();
    render(<VariantGroupEditor groups={[]} onChange={onChange} />);

    expect(screen.getByRole("button", { name: /añadir grupo de variantes/i })).toBeInTheDocument();
    expect(screen.queryByText("Tamaño")).toBeNull();
  });

  it("renders existing groups with their name and options", () => {
    render(<VariantGroupEditor groups={[GROUP]} onChange={vi.fn()} />);

    expect(screen.getByDisplayValue("Tamaño")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Individual")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Familiar")).toBeInTheDocument();
  });

  it("calls onChange with a new empty group when add-group is clicked", async () => {
    const onChange = vi.fn();
    render(<VariantGroupEditor groups={[]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /añadir grupo de variantes/i }));

    expect(onChange).toHaveBeenCalledOnce();
    const [newGroups] = onChange.mock.calls[0];
    expect(newGroups).toHaveLength(1);
    expect(newGroups[0].name).toBe("");
    expect(newGroups[0].options).toHaveLength(0);
  });

  it("calls onChange with updated name when group name is edited", () => {
    const onChange = vi.fn();
    render(<VariantGroupEditor groups={[GROUP]} onChange={onChange} />);

    fireEvent.change(screen.getByDisplayValue("Tamaño"), {
      target: { value: "Formato" },
    });

    expect(onChange).toHaveBeenCalledOnce();
    const [newGroups] = onChange.mock.calls[0];
    expect(newGroups[0].name).toBe("Formato");
  });

  it("calls onChange with a new option when add-option is clicked", async () => {
    const onChange = vi.fn();
    render(<VariantGroupEditor groups={[GROUP]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /añadir opción/i }));

    const lastCall = onChange.mock.calls.at(-1)[0];
    expect(lastCall[0].options).toHaveLength(3);
    expect(lastCall[0].options[2].name).toBe("");
  });

  it("calls onChange without the group when remove-group is clicked", async () => {
    const onChange = vi.fn();
    render(<VariantGroupEditor groups={[GROUP]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /eliminar grupo/i }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("calls onChange without the option when remove-option is clicked", async () => {
    const onChange = vi.fn();
    render(<VariantGroupEditor groups={[GROUP]} onChange={onChange} />);

    // Remove the first option (Individual)
    const removeButtons = screen.getAllByRole("button", { name: /eliminar opción/i });
    await userEvent.click(removeButtons[0]);

    const lastCall = onChange.mock.calls.at(-1)[0];
    expect(lastCall[0].options).toHaveLength(1);
    expect(lastCall[0].options[0].name).toBe("Familiar");
  });
});
