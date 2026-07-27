import { describe, expect, it } from "vitest";
import { localProductService } from "./localProductService";

describe("localProductService", () => {
  it("lists seeded products", async () => {
    const products = await localProductService.listProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  it("creates, updates, and deletes a product", async () => {
    const created = await localProductService.createProduct({
      name: "Test Coat",
      description: "A test coat",
      priceCents: 5000,
      currency: "ILS",
      imageUrl: "/products/trench-coat.svg",
    });
    expect(created.id).toBeTruthy();

    const fetched = await localProductService.getProduct(created.id);
    expect(fetched?.name).toBe("Test Coat");

    const updated = await localProductService.updateProduct(created.id, {
      priceCents: 6000,
    });
    expect(updated.priceCents).toBe(6000);

    await localProductService.deleteProduct(created.id);
    expect(await localProductService.getProduct(created.id)).toBeNull();
  });
});
