import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import { ImageUploader } from "@/features/admin-menu/components/ImageUploader";

vi.mock("@/features/admin-menu/hooks/use-upload-image", () => ({
  useUploadImage: vi.fn(),
}));

const { useUploadImage } = await import("@/features/admin-menu/hooks/use-upload-image");

describe("ImageUploader", () => {
  const mockUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUploadImage).mockReturnValue({
      upload: mockUpload,
      isUploading: false,
    } as any);
  });

  it("shows a placeholder when no image is set", () => {
    render(<ImageUploader value={null} onChange={vi.fn()} />);

    expect(screen.getByText(/sin imagen/i)).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows the current image when value is provided", () => {
    render(<ImageUploader value="http://example.com/pizza.jpg" onChange={vi.fn()} />);

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "http://example.com/pizza.jpg");
  });

  it("renders a file input button", () => {
    render(<ImageUploader value={null} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /seleccionar imagen/i })).toBeInTheDocument();
  });

  it("calls upload and then onChange with the returned URL when a file is selected", async () => {
    const onChange = vi.fn();
    mockUpload.mockResolvedValue("http://localhost:3001/uploads/pizza.jpg");

    render(<ImageUploader value={null} onChange={onChange} />);

    const file = new File(["(image)"], "pizza.jpg", { type: "image/jpeg" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith("http://localhost:3001/uploads/pizza.jpg"));
  });

  it("shows a loading state while uploading", () => {
    vi.mocked(useUploadImage).mockReturnValue({
      upload: mockUpload,
      isUploading: true,
    } as any);

    render(<ImageUploader value={null} onChange={vi.fn()} />);

    expect(screen.getByText(/subiendo/i)).toBeInTheDocument();
  });

  it("shows a remove button when an image is set and calls onChange with null on click", async () => {
    const onChange = vi.fn();
    render(<ImageUploader value="http://example.com/pizza.jpg" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /eliminar imagen/i }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
