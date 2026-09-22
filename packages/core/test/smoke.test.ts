import { describe, expect, it } from "vitest";
import { FACTORY_API_VERSION } from "@dark-factory/contracts";
import { PACKAGE_NAME } from "../src/index";

describe("workspace wiring", () => {
  it("resolves the contracts workspace package", () => {
    expect(FACTORY_API_VERSION).toBe("factory/v1");
  });

  it("core placeholder exports its name", () => {
    expect(PACKAGE_NAME).toBe("@dark-factory/core");
  });
});
