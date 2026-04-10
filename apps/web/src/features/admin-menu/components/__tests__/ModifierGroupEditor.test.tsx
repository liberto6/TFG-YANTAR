import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import { ModifierGroupEditor } from "@/features/admin-menu/components/ModifierGroupEditor";
import type { ModifierGroup } from "@/features/menu/types/menu.types";

const GROUP: ModifierGroup = {
  id: "mg-001",
  name: "Extras",
  required: false,
  selectionType: "MULTIPLE",
  minSelections: 0,
  maxSelections: null,
  sortOrder: 0,
  options: [
    { id: "mo-001", name: "Extra queso", extraPrice: 1.5, sortOrder: 0 },
    { id: "mo-002", name: "Sin cebolla", extraPrice: 0, sortOrder: 1 },
  ],
};

describe("ModifierGroupEditor", () => {
  it("renders an empty state with an add-group button when no groups exist", () => {
    render(<ModifierGroupEditor groups={[]} onChange={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /añadir grupo de modificadores/i }),
    ).toBeInTheDocument();
  });

  it("renders existing groups with name and options", () => {
    render(<ModifierGroupEditor groups={[GROUP]} onChange={vi.fn()} />);

    expect(screen.getByDisplayValue("Extras")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Extra queso")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Sin cebolla")).toBeInTheDocument();
  });

  it("shows the selectionType selector with correct current value", () => {
    render(<ModifierGroupEditor groups={[GROUP]} onChange={vi.fn()} />);

    const select = screen.getByRole("combobox", { name: /tipo de selección/i });
    expect((select as HTMLSelectElement).value).toBe("MULTIPLE");
  });

  it("calls onChange with a new empty group when add-group is clicked", async () => {
    const onChange = vi.fn();
    render(<ModifierGroupEditor groups={[]} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole("button", { name: /añadir grupo de modificadores/i }),
    );

    expect(onChange).toHaveBeenCalledOnce();
    const [newGroups] = onChange.mock.calls[0];
    expect(newGroups).toHaveLength(1);
    expect(newGroups[0].selectionType).toBe("MULTIPLE");
    expect(newGroups[0].options).toHaveLength(0);
  });

  it("calls onChange with a new option when add-option is clicked", async () => {
    const onChange = vi.fn();
    render(<ModifierGroupEditor groups={[GROUP]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /añadir opción/i }));

    const lastCall = onChange.mock.calls.at(-1)[0];
    expect(lastCall[0].options).toHaveLength(3);
  });

  it("calls onChange without the group when remove-group is clicked", async () => {
    const onChange = vi.fn();
    render(<ModifierGroupEditor groups={[GROUP]} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /eliminar grupo/i }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("calls onChange with updated selectionType when selector changes", async () => {
    const onChange = vi.fn();
    render(<ModifierGroupEditor groups={[GROUP]} onChange={onChange} />);

    await userEvent.selectOptions(
      screen.getByRole("combobox", { name: /tipo de selección/i }),
      "SINGLE",
    );

    const lastCall = onChange.mock.calls.at(-1)[0];
    expect(lastCall[0].selectionType).toBe("SINGLE");
  });
});
